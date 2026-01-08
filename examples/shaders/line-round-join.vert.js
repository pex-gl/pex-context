export default /* glsl */ `
precision highp float;
attribute vec2 pointA, pointB, pointC;
attribute float id;
uniform float width;
uniform mat4 projection;

const float resolution = 16.0;
const float HALF_PI = 1.57079632679;

void main() {
  // Calculate the x- and y- basis vectors.
  vec2 xBasis = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
  vec2 yBasis = vec2(-xBasis.y, xBasis.x);

  // Calculate the normal vectors for each neighboring segment.
  vec2 ab = pointB - pointA;
  vec2 cb = pointB - pointC;
  vec2 abn = normalize(vec2(-ab.y, ab.x));
  vec2 cbn = -normalize(vec2(-cb.y, cb.x));

  // Determine the direction of the bend.
  float sigma = sign(dot(ab + cb, yBasis));

  // If this is the zeroth id, it's the center of our circle. Stretch it to meet the segments' intersection.
  if (id == 0.0) {
    gl_Position = projection * vec4(pointB + -0.5 * yBasis * sigma * width / dot(yBasis, abn), 0, 1);
    return;
  }

  // Otherwise find the angle for this vertex.
  float theta = acos(dot(abn, cbn));
  theta = (sigma * HALF_PI) + -0.5 * theta + theta * (id - 1.0) / resolution;

  // Find the vertex position from the angle and multiply it by our basis vectors.
  vec2 pos = 0.5 * width * vec2(cos(theta), sin(theta));
  pos = pointB + xBasis * pos.x + yBasis * pos.y;

  gl_Position = projection * vec4(pos, 0, 1);
}
`;
