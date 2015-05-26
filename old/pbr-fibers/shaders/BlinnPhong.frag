varying vec3 vLightPos;
varying vec3 vPosition;

uniform float shininess;
const float PI = 3.14159265358979323846;

void main_blinnPhong(in vec3 normalIn, inout vec4 color) {
  vec3 L = normalize(vLightPos - vPosition); //lightDir
  vec3 V = normalize(-vPosition);
  vec3 N = normalize(vNormal);

  vec3 halfVec = normalize(L + V);
  float specular = max(0.0, dot(N, halfVec));

  float D = max(pow(specular, shininess), 0.0);
  //D *= (2+shininess) / (2*PI); //normalized

  color += D;// * specularColor;
}