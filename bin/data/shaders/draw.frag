OF_GLSL_SHADER_HEADER
uniform float texCoordWidthScale;
uniform float texCoordHeightScale;

uniform sampler2D tex0;
uniform vec3 iResolution;
uniform float iTime;

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
	vec2 uv = (gl_FragCoord.xy/pos.xy);
	vec4 col = texture(tex0, uv);
	col = pow(col, vec4(1.5));
	uv = gl_FragCoord.xy/pos.xy-0.5;
	oFragColor = col;
	
//	float noiseVal = 0.5 + 0.5 * Pseudo3dNoise(vec3(pos * 10.0, iTime));
//	oFragColor.rgb = vec3(noiseVal);
	
	
}
