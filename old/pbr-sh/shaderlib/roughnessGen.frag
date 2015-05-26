void getRoughness(inout FragData data) {
  float depth = length(data.position) - 0.5 * snoise(data.normalWorld * 10.0) - 0.5 * snoise(data.normalWorld * 2.0);
  if (depth > 0.62) {
    data.roughness = 0.4;
  }
  else if (depth > 0.61) {
    data.roughness = 0.1;
  }
  else if (depth > 0.52) {
    data.roughness = 0.9;
  }
  else if (depth > 0.42) {
    data.specularity = mix(vec3(0.4), vec3(0.9), (depth - 0.42)/0.1);
  }
  else {
    data.roughness = 0.8;
  }

  //data.roughness = 0.8;
}
