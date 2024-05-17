export default /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vPosition;
varying vec3 vNormal;

void main () {
  vec4 positionWorld = uModelMatrix * vec4(aPosition, 1.0);
  vPosition = positionWorld.xyz;
  vNormal = mat3(uModelMatrix) * aNormal;

  gl_Position = uProjectionMatrix * uViewMatrix * positionWorld;
}
`;
