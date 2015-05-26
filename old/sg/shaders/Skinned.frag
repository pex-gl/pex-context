varying vec3 ecPosition;
varying vec3 mcPosition;
varying vec3 ecNormal;
varying vec3 mcNormal;

void main_skinned(out vec3 positionOut, out vec3 modelPositionOut, out vec3 normalOut, out vec3 modelNormalOut) {
  positionOut = ecPosition;
  modelPositionOut = mcPosition;
  normalOut = normalize(ecNormal);
  modelNormalOut = normalize(mcNormal);
}