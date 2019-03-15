module.exports = /* glsl */ `
precision highp float;

varying vec3 vNormalWorld;
varying vec3 vPositionWorld;

uniform vec3 uCameraPosition;
uniform samplerCube uEnvMap;

void main () {
  vec3 N = normalize(vNormalWorld);
  vec3 I = normalize(vPositionWorld - uCameraPosition);
  vec3 R = reflect(I, N);
  R.z *= -1.0;

  gl_FragColor = textureCube(uEnvMap, R);
}
`
