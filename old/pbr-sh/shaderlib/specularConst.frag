uniform float specularity;

void getSpecularity(inout FragData data) {
  data.specularity = vec3(specularity, specularity, specularity);
}
