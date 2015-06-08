uniform samplerCube texture;
varying vec3 vNormal;
void main() {
  gl_FragColor = textureCube(texture, (vNormal));
  //gl_FragColor = vec4(vNormal, 1.0);
}
