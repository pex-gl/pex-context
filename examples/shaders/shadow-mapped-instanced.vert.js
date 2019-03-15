const { transposeMat4, quatToMat4, inverseMat4 } = require('./math.glsl')

module.exports = /* glsl */ `
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aOffset;
attribute vec3 aScale;
attribute vec4 aRotation;
attribute vec4 aColor;

varying vec3 vNormalWorld;
varying vec3 vWorldPosition;
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
  gl_Position = uProjectionMatrix * modelView * position;
  vWorldPosition = (uModelMatrix * position).xyz;
  mat4 invViewMatrix = inverse(uViewMatrix);
  vec3 normalView = mat3(transpose(inverse(modelView)) * rotationMat) * aNormal;
  vNormalWorld = vec3(uModelMatrix * vec4(normalView, 0.0));
  vColor = aColor;
}
`
