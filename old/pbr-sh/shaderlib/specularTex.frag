uniform sampler2D specularMap;

void getSpecularity(inout FragData data) {
  data.specularity = correctGammaInput(sampleTexture2D(data, specularMap).rgb);
}
