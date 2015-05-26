void getAlbedo(inout FragData data) {
  float depth = length(data.position) - 0.5 * snoise(data.normalWorld * 10.0) - 0.5 * snoise(data.normalWorld * 2.0);
  if (depth > 0.62) {
    data.albedo = correctGammaInput(vec3(depth, depth*0.5, 0.0));
  }
  else if (depth > 0.61) {
    data.albedo = correctGammaInput(vec3(0.0));
  }
  else if (depth > 0.52) {
    data.albedo = correctGammaInput(vec3(0.01));
  }
  else if (depth > 0.42) {
    data.albedo = mix(correctGammaInput(vec3(0.0, 0.3, 0.6) * 1.5), correctGammaInput(vec3(0.1)), (depth - 0.42)/0.1);
  }
  else {
    data.albedo = correctGammaInput(vec3(0.01));
  }

  //data.albedo = vec3(0.2);
}
