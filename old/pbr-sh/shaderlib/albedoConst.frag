uniform vec4 albedoColor; //assumes sRGB color, not linear

void getAlbedo(inout FragData data) {
  data.albedo = correctGammaInput(albedoColor.rgb);
}
