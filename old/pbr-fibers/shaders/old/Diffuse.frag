uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform float wrap;
varying vec3 vNormal;
varying vec3 vLightPos;

void main() {
  vec3 L = normalize(vLightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  gl_FragColor = ambientColor + NdotL * diffuseColor;
}