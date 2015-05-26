uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vColor;

void main() {
	vNormal = normal;
	vPosition = position;
	vColor = color;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
