void getSpecularity(inout FragData data) {
  float depth = length(data.position) - 0.5 * snoise(data.normalWorld * 10.0) - 0.5 * snoise(data.normalWorld * 2.0);
  if (depth > 0.62) {
    data.specularity = vec3(0.05);
  }
  else if (depth > 0.61) {
    data.specularity = correctGammaInput(vec3(0.95, 0.9, 0.9));
  }
  else if (depth > 0.52) {
    data.specularity = vec3(0.05);
  }
  else if (depth > 0.42) {
    data.specularity = mix(vec3(0.5), vec3(0.05), (depth - 0.42)/0.1);
  }
  else {
    data.specularity = vec3(0.05);
  }

  //data.specularity = vec3(0.2);
}
