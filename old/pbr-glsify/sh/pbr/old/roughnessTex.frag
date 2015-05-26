uniform sampler2D glossMap;

void getRoughness(inout FragData data) {
  //roughness is 0=smooth/shiny .. 1=rought/matte
  //glossiness is 0=matte .. 1=glossy/shiny
  data.roughness = 1.0 - correctGammaInput(sampleTexture2D(data, glossMap).rgb).r;
}
