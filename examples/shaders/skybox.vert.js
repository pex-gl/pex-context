const { transposeMat3, inverseMat4 } = require('./math.glsl')

module.exports = /* glsl */ `
// Based on http://gamedev.stackexchange.com/questions/60313/implementing-a-skybox-with-glsl-version-330
attribute vec2 aPosition;

${inverseMat4}
${transposeMat3}

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec3 wcNormal;

void main() {
  vec4 position = vec4(aPosition, 0.0, 1.0);
  mat4 inverseProjection = inverse(uProjectionMatrix);
  mat3 inverseModelview = transpose(mat3(uViewMatrix));
  vec3 unprojected = (inverseProjection * position).xyz;
  wcNormal = inverseModelview * unprojected;

  gl_Position = position;
}
`
