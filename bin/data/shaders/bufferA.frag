OF_GLSL_SHADER_HEADER

// -- tweakable parameters --
// size of particles
#define PARTICLE_SIZE 0.004
// amount of particles
#define PARTICLES 128
// opacity of particles
#define OPACITY 1.0
// step size per frame
#define STEP_SIZE 0.002
// scale of the noise function used for the curls
#define FIELD_SCALE 2.5
// offset of the noise function for variety
#define FIELD_OFFSET vec2(0, 0)
// if defined, use curl field else just noise field
//#define CURL
// if defined, particles have the given probability to teleport to a random position each frame (the closer to 0 the longer the paths)
#define RESET_PROB 0.02
// if 2, the mouseposition modifies the distortion if 1 it doesn't and if 0 it is the only distortion
#define MOUSE 1
// if defined, the image appears white with black dots, else, it's the other way around
#define LIGHT_MODE
// if defined, the particles are reset when out of bounds
//#define RESET_OUTOFBOUNDS
// if defined, a subtle blur is added to the older lines.
//#define BLUR
// if defined a vignette effect is added
//#define VIGNETTE


// -- helper functions and definitions --

// reset key
const int R = 82;

// indexing of the position buffer (Buffer A)
ivec2 idxToPos(int i, int width) {return ivec2(i / width, i % width);}
int posToIdx(ivec2 i, int width) {return i.x * width + i.y;}


// -- noise functions --

float hash11(float p)
{
	p = fract(p * .1031);
	p *= p + 33.33;
	p *= p + p;
	return fract(p);
}

vec2 hash22(vec2 co) {
	return fract(sin(vec2(dot(co,vec2(167.1,311.7)),dot(co,vec2(269.5,183.3))))*737.5453);
}

float smoother(float t) {
	t = clamp(t, 0.0, 1.0);
	// 6t^{5}-15t^{4}+10t^{3}; polynomial used for smooth interpolation (from the same family of curves as the smoothstep function)
	// this function has a continuous second derivative which makes it very useful for many applications
	return 6.0*(t*t*t*t*t) - 15.0*(t*t*t*t) + 10.0*(t*t*t);
}

float perlin2d(vec2 p) {
	vec2 i = floor(p);
	vec2 j = ceil(p);
	vec2 f = fract(p);
	
	//float su = smoothstep(uv.x, 0.0, 1.0);
	//float sv = smoothstep(uv.y, 0.0, 1.0);
	float su = smoother(f.x);
	float sv = smoother(f.y);

	float n0 = (1.-su)*dot(normalize(hash22(vec2(i.x, i.y))*2.-1.), f)
				 + su *dot(normalize(hash22(vec2(j.x, i.y))*2.-1.), f-vec2(1, 0));
	float n1 = (1.-su)*dot(normalize(hash22(vec2(i.x, j.y))*2.-1.), f-vec2(0, 1))
				 + su *dot(normalize(hash22(vec2(j.x, j.y))*2.-1.), f-1.);
	
	return (1.-sv)*n0 + sv*n1;
}

// had to define them as macros because iMouse and iResolution are not defined in the "Common" Tab
#define mouse_to_world(p) (iMouse.xy/iResolution.xy-(p)/vec2(iResolution.x/iResolution.y, 1.0))*vec2(iResolution.x/iResolution.y, 1.0)
#if MOUSE == 2
#define distortion(p) (perlin2d((p).xy * FIELD_SCALE + FIELD_OFFSET)*(clamp(length(mouse_to_world(p)), 0.0,0.4)*2.5-1.)*2.0)
#elif MOUSE == 1
#define distortion(p) (perlin2d((p).xy * FIELD_SCALE + FIELD_OFFSET))
#else
#define distortion(p) (clamp(length(mouse_to_world(p)), 0.0, 0.5)*2.-.5)
#endif

#define EPS 0.0001
#ifdef CURL
// the raw code of this function is commented out at the bottom (curl())
#define field(p) normalize(vec2((distortion((p) + vec2(0,EPS)) - distortion((p) - vec2(0,EPS)))/(2.0 * EPS), -(distortion((p) + vec2(EPS,0)) - distortion((p) - vec2(EPS,0)))/(2.0 * EPS)))*4.0
#else
vec2 field(vec2 p) {
	return normalize(vec2(perlin2d(p*FIELD_SCALE+FIELD_OFFSET), perlin2d(p*FIELD_SCALE + FIELD_OFFSET + 100.)))*2.;
}
#endif



/*
vec2 curl(vec2 p) {
	// source: https://al-ro.github.io/projects/curl/
	
	float eps = 0.0001;
	vec2 r = vec2(0);
	
	float n1 = distortion(vec2(p.x + eps, p.y));
	float n2 = distortion(vec2(p.x - eps, p.y));
	
	r.y = (n1 - n2)/(2.0 * eps);

	n1 = distortion(vec2(p.x, p.y + eps));
	n2 = distortion(vec2(p.x, p.y - eps));
	
	r.x = (n1 - n2)/(2.0 * eps);
	return vec2(r.x, -r.y);
}*/


uniform float texCoordWidthScale;
uniform float texCoordHeightScale;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
out vec4 oFragColor;

vec2 GetGradient(vec2 intPos, float t) {
	
	// Uncomment for calculated rand
	float rand = fract(sin(dot(intPos, vec2(12.9898, 78.233))) * 43758.5453);;
	
	// Texture-based rand (a bit faster on my GPU)
//	float rand = texture(tex0, intPos / 64.0).r;
	
	// Rotate gradient: random starting rotation, random rotation rate
	float angle = 6.283185 * rand + 4.0 * t * rand;
	return vec2(cos(angle), sin(angle));
}


float Pseudo3dNoise(vec3 pos) {
	vec2 i = floor(pos.xy);
	vec2 f = pos.xy - i;
	vec2 blend = f * f * (3.0 - 2.0 * f);
	float noiseVal =
		mix(
			mix(
				dot(GetGradient(i + vec2(0, 0), pos.z), f - vec2(0, 0)),
				dot(GetGradient(i + vec2(1, 0), pos.z), f - vec2(1, 0)),
				blend.x),
			mix(
				dot(GetGradient(i + vec2(0, 1), pos.z), f - vec2(0, 1)),
				dot(GetGradient(i + vec2(1, 1), pos.z), f - vec2(1, 1)),
				blend.x),
		blend.y
	);
	return noiseVal / 0.7; // normalize to about [-1..1]
}

void main(){
	vec2 pos = gl_FragCoord.xy;
	pos.x /= texCoordWidthScale;
	pos.y /= texCoordHeightScale;
	
	vec2 uv = (gl_FragCoord.xy/iResolution.y);

	int n = posToIdx(ivec2(gl_FragCoord), int(iResolution.y));
	// position of dot
	vec2 p = texelFetch(tex0, ivec2(gl_FragCoord), 0).xy;
#ifdef CURL
	p += field(p)*STEP_SIZE/FIELD_SCALE;
#else
	p += field(p)*STEP_SIZE;
#endif
	oFragColor = vec4(p,0.0,1.0);
	
	// the dot gets random position when...
	// ...pressing r for resetting
	/// bool r = bool(texelFetch(tex1, ivec2(R, 0), 0).x);
	
#ifdef RESET_OUTOFBOUND
	// ...out of bounds
	bool b = p.x > iResolution.x/iResolution.y || p.x < 0.0 || p.y > 1.0 || p.y < 0.0;
#else
	bool b;
#endif

	// ...randomly
#ifdef RESET_PROB
	bool h = hash11(float(n)+float(iFrame)/127.0) < RESET_PROB;
#else
	bool h = false;
#endif
	
	//bool o = texture(iChannel2, p).x < 0.5;
	// if (r || b || h || iFrame == 0) {
	if (b || h || iFrame == 0) {
		// reset position
		oFragColor = vec4(hash22(uv+fract(iTime))*vec2(iResolution.x/iResolution.y, 1.0), 0.0, 1.0);
	}
	
//	float noiseVal = 0.5 + 0.5 * Pseudo3dNoise(vec3(pos * 10.0, iTime));
//	oFragColor.rgb = vec3(noiseVal);
//	oFragColor.a = 1;
}
