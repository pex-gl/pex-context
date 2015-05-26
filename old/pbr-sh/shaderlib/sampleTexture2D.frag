vec4 sampleTexture2D(inout FragData data, sampler2D texture) {
  return texture2D(texture, data.texCoord);
}
