varying vec3 vNormal;
void main() {
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}
