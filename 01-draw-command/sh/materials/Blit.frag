varying vec2 vTexCoord;
uniform sampler2D texture;
void main() {
  gl_FragColor = vec4(vTexCoord, 0.0, 1.0);
  gl_FragColor = texture2D(texture, vTexCoord);
}
