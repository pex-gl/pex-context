uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
//uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  //gl_PointSize = pointSize;
}