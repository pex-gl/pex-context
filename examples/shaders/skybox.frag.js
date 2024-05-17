export default /* glsl */ `
precision highp float;

uniform samplerCube uEnvMap;
uniform float uExposure;

varying vec3 wcNormal;

void main() {
  vec3 N = normalize(wcNormal);
  vec3 color = textureCube(uEnvMap, N).rgb;
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}
`;
