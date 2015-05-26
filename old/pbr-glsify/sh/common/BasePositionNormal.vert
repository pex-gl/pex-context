uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
//uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}