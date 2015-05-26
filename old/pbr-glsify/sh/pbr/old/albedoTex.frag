uniform sampler2D albedoMap;

void getAlbedo(inout FragData data) {
  data.albedo = correctGammaInput(sampleTexture2D(data, albedoMap).rgb);
}
