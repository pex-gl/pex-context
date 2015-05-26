vec3 correctGammaOutput(vec3 color) {
  return pow(color, vec3(1.0/2.2));
}

#pragma glslify: export(correctGammaOutput)