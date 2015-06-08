attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
varying vec4 vColor;
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  vColor = vec4(normal/2.0 + 0.5, 1.0);
}
