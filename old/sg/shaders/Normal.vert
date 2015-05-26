attribute vec3 normal;
uniform mat4 normalMatrix;

varying vec3 ecNormal;
varying vec3 mcNormal;

void main_normal() {
  ecNormal = normalize((normalMatrix * vec4(normal, 1.0)).xyz);
  mcNormal = normal;
}