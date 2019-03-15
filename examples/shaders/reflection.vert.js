module.exports = /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vNormalWorld;
varying vec3 vPositionWorld;

void main () {
  vec4 positionWorld = uModelMatrix * vec4(aPosition, 1.0);
  vPositionWorld = positionWorld.xyz;
  gl_Position = uProjectionMatrix * uViewMatrix * positionWorld;
  vNormalWorld = mat3(uModelMatrix) * aNormal;
}`
