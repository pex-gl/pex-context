uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normal;
}
