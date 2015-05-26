uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
void main_output(in vec3 positionIn) {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(positionIn, 1.0);
}
