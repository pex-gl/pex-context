varying vec3 ecNormal;
varying vec3 mcNormal;

void main_normal(out vec3 normalOut, out vec3 modelNormal) {
  normalOut = normalize(ecNormal);
  modelNormal = normalize(mcNormal);
}