uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
attribute vec3 aPosition;
attribute vec3 aNormal;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  mat4 modelView = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelView * vec4(aPosition, 1.0);
  vWorldPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vNormal = mat3(modelView) * aNormal;
}
