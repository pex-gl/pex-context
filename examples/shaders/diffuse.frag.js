import gamma from "./gamma.glsl.js";

export default /* glsl */ `
precision highp float;

uniform mat4 uViewMatrix;
uniform vec4 uDiffuseColor;

varying vec3 vNormal;

${gamma}

void main () {
  vec3 N = normalize(vNormal);
  vec3 lightDirWorld = normalize(vec3(1.0, 2.0, 3.0));
  vec3 L = vec3(uViewMatrix * vec4(lightDirWorld, 0.0));
  float dotNL = dot(N, L);
  float wrap = 1.0;
  float diffuse = (dotNL + wrap) / (1.0 + wrap);

  vec3 baseColor = toLinear(uDiffuseColor.rgb);
  vec3 finalColor = baseColor * diffuse;
  vec3 outputColor = toGamma(finalColor);

  gl_FragColor = vec4(outputColor, 1.0);
}
`;
