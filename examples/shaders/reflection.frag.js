export default /* glsl */ `
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uCameraPosition;
uniform samplerCube uEnvMap;

void main () {
  vec3 N = normalize(vNormal);
  vec3 I = normalize(vPosition - uCameraPosition);
  vec3 R = reflect(I, N);
  R.z *= -1.0;

  gl_FragColor = textureCube(uEnvMap, R);
}
`;
