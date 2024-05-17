export default /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec3 vNormal;
varying vec4 vColor;

void main () {
  vNormal = aNormal;
  vColor = vec4(aNormal * 0.5 + 0.5, 1.0);

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}
`;
