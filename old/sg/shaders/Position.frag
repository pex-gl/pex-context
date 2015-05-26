varying vec3 ecPosition;
varying vec3 mcPosition;
varying vec3 wcPosition;

void main_position(out vec3 positionOut, out vec3 modelPositionOut) {
  positionOut = ecPosition;
  modelPositionOut = mcPosition;
}