attribute vec3 normal;
uniform mat4 normalMatrix;
varying vec3 vNormal;

void main_normal() {
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}