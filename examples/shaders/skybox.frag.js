export default /* glsl */ `
precision highp float;

// uniform sampler2D uEnvMap;
uniform samplerCube uEnvMap;
uniform float uExposure;

varying vec3 wcNormal;

void main() {
  vec3 N = normalize(wcNormal);
  N.z *= -1.0;
  // vec3 color = texture2D(uEnvMap, envMapEquirect(N)).rgb;
  vec3 color = textureCube(uEnvMap, N).rgb;
  gl_FragColor.rgb = color;
  gl_FragColor.a = 1.0;
}`;
