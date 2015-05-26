uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
void main_output(in vec3 positionIn) {
  gl_Position = projectionMatrix * viewMatrix * vec4(positionIn, 1.0);
}
