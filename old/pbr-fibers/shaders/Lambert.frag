varying vec3 vLightPos;

void main_lambert(in vec3 positionIn, in vec3 normalIn, inout vec4 color) {
  vec3 L = normalize(vLightPos - positionIn);
  float NdotL = max(0.0, dot(normalIn, L));
  color.rgb *= vec3(NdotL);
}