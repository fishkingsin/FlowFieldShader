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


uniform float texCoordWidthScale;
uniform float texCoordHeightScale;

uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;
uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;

out vec4 oFragColor;
ivec2 idxToPos(int i, int width) {return ivec2(i / width, i % width);}
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

// -- helper functions and definitions --

// reset key
const int R = 82;

void main(){
	vec2 pos = gl_FragCoord.xy;
	pos.x /= texCoordWidthScale;
	pos.y /= texCoordHeightScale;
		
	vec4 col;
	vec2 uv = (gl_FragCoord.xy/iResolution.y);// + vec2((iResolution.y - iResolution.x) / iResolution.y / 2.0, 0));

	// rendering the dots
	float minDist = 2.;
	for (int i = 0; i < PARTICLES; i++) {
		vec2 p = texelFetch(tex0,idxToPos(i, int(iResolution.y)),0).xy;
		minDist = min(minDist, length(uv-p));
	}
	

	if ((iFrame == 0) || bool(texelFetch(tex2, ivec2(R, 0), 0).x)) {
		col = vec4(0);
	} else {
		col = texture(tex1,(gl_FragCoord.xy/iResolution.xy)
#ifdef BLUR
		// adding a small amount to the coordinates adds a subtle blur to the old lines
		+0.000006*(iFrame%2==0?-1.0:1.0)
#endif
		);
	}
	col = col + (1.-col) * vec4(OPACITY*smoothstep(PARTICLE_SIZE + 0.0015, PARTICLE_SIZE - 0.0015, minDist));
	
	// damping
	col = col*0.996;
	
	// col = vec3(texelFetch(iChannel0, ivec2(gl_FragCoord.xy), 0));

	oFragColor= col;
	
//	float noiseVal = 0.5 + 0.5 * Pseudo3dNoise(vec3(pos * 10.0, iTime));
//	oFragColor.rgb = vec3(noiseVal);
//	oFragColor.a = 1;
}
