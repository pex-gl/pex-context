export default /* glsl */ `
precision highp float;
attribute vec2 position;
attribute vec2 pA, pB, pC;
uniform float width;
uniform mat4 projection;

void main() {

  if (position.x == 0.0) {
    vec2 xBasis = pB - pA;
    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
    vec2 point = pA + xBasis * position.x + yBasis * width * position.y;
    gl_Position = projection * vec4(point, 0, 1);
    return;
  }

  // Find the normal vector.
  vec2 tangent = normalize(normalize(pC - pB) + normalize(pB - pA));
  vec2 normal = vec2(-tangent.y, tangent.x);

  // Find the perpendicular vectors.
  vec2 ab = pB - pA;
  vec2 cb = pB - pC;
  vec2 abNorm = normalize(vec2(-ab.y, ab.x));

  // Determine the bend direction.
  float sigma = sign(dot(ab + cb, normal));

  if (sign(position.y) == -sigma) {
    vec2 position = 0.5 * normal * -sigma * width / dot(normal, abNorm);
    gl_Position = projection * vec4(pB + position, 0, 1);
  } else {
    vec2 xBasis = pB - pA;
    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
    vec2 point = pA + xBasis * position.x + yBasis * width * position.y;
    gl_Position = projection * vec4(point, 0, 1);
  }
}
`;
