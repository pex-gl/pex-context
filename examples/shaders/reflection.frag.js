export default /* glsl */ `
precision highp float;

varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uCameraPosition;
uniform samplerCube uEnvMap;

void main () {
  vec3 I = normalize(vPosition - uCameraPosition);
  vec3 R = reflect(I, normalize(vNormal));
  gl_FragColor = textureCube(uEnvMap, R);
}
`;
