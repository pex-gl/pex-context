varying vec3 vLightPos;

uniform float wrap;

void main_lambertWrapped(in vec3 positionIn, in vec3 normalIn, inout vec4 color) {
  vec3 L = normalize(vLightPos - positionIn);
  float NdotL = max(0.0, (dot(normalIn, L) + wrap)/(1.0 + wrap));
  color.rgb *= vec3(NdotL);
}