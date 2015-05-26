//uniform vec4 color;
//uniform bool premultiplied;

void main() {
  //gl_FragColor = color;
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  //if (premultiplied) {
  //  gl_FragColor.rgb *= color.a;
  //}
}