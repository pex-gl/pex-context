varying vec3 vLightPos;
varying vec3 vPosition;

uniform float shininess;

void main_normal(in vec3 normalIn, inout vec4 color) {
  vec3 L = normalize(vLightPos - vPosition); //lightDir
  vec3 V = normalize(-vPosition); //view vector from point to camera
  vec3 N = normalize(vNormal);

  vec3 R = reflect(-L, N); //reflect takes incoming light direction
  float specular = max(0.0, dot(R, V));
  float NdotL = dot(N, L); //normalized

  color += max(pow(specular, shininess), 0.0) / NdotL;// * specularColor;
}