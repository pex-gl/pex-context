import { transposeMat4, quatToMat4 } from "./math.glsl.js";

export default /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;

attribute vec3 aOffset;
attribute vec3 aScale;
attribute vec4 aRotation;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec4 vColor;

${transposeMat4}
${quatToMat4}

void main() {
  vec4 position = vec4(aPosition, 1.0);
  position.xyz *= aScale;
  position = quatToMat4(aRotation) * position;
  position.xyz += aOffset;

  vColor = vec4(aNormal * 0.5 + 0.5, 1.0);

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * position;
}
`;
