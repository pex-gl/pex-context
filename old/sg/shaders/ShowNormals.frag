void main_showNormals(in vec3 normalIn, out vec4 colorOut) {
  colorOut = vec4(normalIn * 0.5 + 0.5, 1.0);
}