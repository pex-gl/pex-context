import { transposeMat3, inverseMat4 } from "./math.glsl.js";

// Based on http://gamedev.stackexchange.com/questions/60313/implementing-a-skybox-with-glsl-version-330
export default /* glsl */ `
attribute vec2 aPosition;

${inverseMat4}
${transposeMat3}

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 wcNormal;

void main() {
  mat4 inverseProjection = inverse(uProjectionMatrix);
  mat3 inverseModelview = transpose(mat3(uViewMatrix));
  vec3 unprojected = (inverseProjection * vec4(aPosition, 0.0, 1.0)).xyz;
  wcNormal = (uModelMatrix * vec4(inverseModelview * unprojected, 1.0)).xyz;

  gl_Position = vec4(aPosition, 0.9999, 1.0);
}
`;
