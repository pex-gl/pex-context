vec4 sampleTexture2D(inout FragData data, sampler2D texture) {
  float scale = 1.0;

  vec3 blending = abs( normalize(data.normalWorld) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec4 xaxis = texture2D( texture, data.positionWorld.zy * scale);
  vec4 yaxis = texture2D( texture, data.positionWorld.xz * scale);
  vec4 zaxis = texture2D( texture, data.positionWorld.xy * scale);

  //blend the results of the 3 planar projections.
  vec4 tex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

  return tex;
}
