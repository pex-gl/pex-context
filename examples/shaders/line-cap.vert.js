export default /* glsl */ `
precision highp float;
attribute vec2 position;
attribute vec2 pA, pB;
uniform float width;
uniform mat4 projection;

void main() {
  vec2 xBasis = normalize(pA - pB);
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);
  vec2 point = pA + xBasis * width * position.x + yBasis * width * position.y;
  gl_Position = projection * vec4(point, 0, 1);
}
`;
