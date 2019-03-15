module.exports = /* glsl */ `
precision mediump float;

varying vec3 vNormal;

void main () {
  gl_FragColor.rgb = vNormal * 0.5 + 0.5;
  gl_FragColor.a = 1.0;
}
`
