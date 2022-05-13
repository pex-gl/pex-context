export default /* glsl */ `
precision highp float;

uniform mat4 uViewMatrix;
uniform vec4 uDiffuseColor;

varying vec3 vNormal;

void main () {
  vec3 N = normalize(vNormal);
  vec3 lightDirWorld = normalize(vec3(1.0, 2.0, 3.0));
  vec3 L = vec3(uViewMatrix * vec4(lightDirWorld, 0.0));
  float dotNL = dot(N, L);
  float wrap = 1.0;
  float diffuse = (dotNL + wrap) / (1.0 + wrap);

  vec3 baseColor = pow(uDiffuseColor.rgb, vec3(2.2));
  vec3 finalColor = baseColor * diffuse;
  vec3 outputColor = pow(finalColor, vec3(1.0 / 2.2));
  gl_FragColor.rgb = outputColor;
  gl_FragColor.a = 1.0;
}
`;
