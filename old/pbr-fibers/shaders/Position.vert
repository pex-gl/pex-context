uniform mat4 modelViewMatrix;
attribute vec3 position;
varying vec3 vPosition;

void main_position(out vec3 positionOut) {
  positionOut = position;
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
}