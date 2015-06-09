attribute vec3 position;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 invViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelMatrix;
varying vec3 vNormal;

varying vec3 normalView;
varying vec3 normalWorld;
varying vec3 positionView;
varying vec3 positionWorld;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  vNormal = normalize(normal);

  positionWorld = vec3(modelMatrix * vec4(position, 1.0));
  normalView = vec3(normalMatrix * vec4(normal, 1.0));
  normalWorld = vec3(invViewMatrix * vec4(normalView, 0.0));
  positionView = vec3(viewMatrix * modelMatrix * vec4(position, 1.0));
}
