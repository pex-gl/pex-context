attribute vec3 position;
varying vec3 ecPosition;
varying vec3 mcPosition;
varying vec3 wcPosition;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;

void main_position(out vec3 positionOut) {
  positionOut = position;
  ecPosition = vec3(modelViewMatrix * vec4(position, 1.0));
  mcPosition = position;
  wcPosition = vec3(modelWorldMatrix * vec4(position, 1.0));
}