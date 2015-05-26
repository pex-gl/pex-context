//uniform vec4 color;
//uniform bool premultiplied;

varying vec3 vNormal;

//#pragma glslify: diffuse = require(glsl-diffuse-lambert)
#pragma glslify: diffuse = require(glsl-diffuse-oren-nayar)

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(10.0, 10.0, 10.0));
  vec3 E = vec3(0.0, 0.0, -1.0);
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor.rgb = N*0.5 + 0.5;

  //float light = diffuse(L, N);
  float light = diffuse(L, E, N, 0.5, 1.0);
  float lightGammaCorrected = pow(light, 1.0/2.2);

  gl_FragColor = vec4(lightGammaCorrected, lightGammaCorrected, lightGammaCorrected, 1.0);
}