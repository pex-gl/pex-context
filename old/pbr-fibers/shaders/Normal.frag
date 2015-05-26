varying vec3 vNormal;

void main_normal(out vec3 normalOut) {
  normalOut = normalize(vNormal);
}