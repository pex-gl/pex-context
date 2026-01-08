export default /* glsl */ `
precision highp float;
attribute vec2 pointA, pointB, pointC;
attribute vec4 position;
uniform float width;
uniform mat4 projection;

void main() {
  // Find the miter vector.
  vec2 tangent = normalize(normalize(pointC - pointB) + normalize(pointB - pointA));
  vec2 miter = vec2(-tangent.y, tangent.x);

  // Find the perpendicular vectors.
  vec2 ab = pointB - pointA;
  vec2 cb = pointB - pointC;
  vec2 abNorm = normalize(vec2(-ab.y, ab.x));
  vec2 cbNorm = -normalize(vec2(-cb.y, cb.x));

  // Determine the bend direction.
  float sigma = sign(dot(ab + cb, miter));

  // Calculate the basis vectors for the miter geometry.
  vec2 p0 = 0.5 * width * sigma * (sigma < 0.0 ? abNorm : cbNorm);
  vec2 p1 = 0.5 * miter * sigma * width / dot(miter, abNorm);
  vec2 p2 = 0.5 * width * sigma * (sigma < 0.0 ? cbNorm : abNorm);
  vec2 p3 = -0.5 * miter * sigma * width / dot(miter, abNorm);

  // Calculate the final point position.
  vec2 point = pointB + position.x * p0 + position.y * p1 + position.z * p2 + position.w * p3;
  gl_Position = projection * vec4(point, 0, 1);
}
`;
