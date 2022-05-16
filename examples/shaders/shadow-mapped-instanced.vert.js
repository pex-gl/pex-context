import { transposeMat4, quatToMat4, inverseMat4 } from "./math.glsl.js";

export default /* glsl */ `
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;

attribute vec3 aOffset;
attribute vec4 aRotation;
attribute vec3 aScale;
attribute vec4 aColor;

varying vec3 vPositionWorld;
varying vec3 vNormal;
varying vec4 vColor;

${transposeMat4}
${quatToMat4}
${inverseMat4}

void main() {
  mat4 modelView = uViewMatrix * uModelMatrix;

  vec4 position = vec4(aPosition, 1.0);
  position.xyz *= aScale;

  mat4 rotationMat = quatToMat4(aRotation);
  position =  rotationMat * position;
  position.xyz += aOffset;

  mat4 invViewMatrix = inverse(uViewMatrix);
  vec3 normalView = mat3(transpose(inverse(modelView)) * rotationMat) * aNormal;

  vPositionWorld = (uModelMatrix * position).xyz;
  vNormal = vec3(uModelMatrix * vec4(normalView, 0.0));
  vColor = aColor;

  gl_Position = uProjectionMatrix * modelView * position;
}
`;
