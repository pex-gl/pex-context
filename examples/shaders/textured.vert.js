export default /* glsl */ `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec2 vTexCoord;

void main () {
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`;
