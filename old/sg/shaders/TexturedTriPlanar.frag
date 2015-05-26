uniform sampler2D triPlanarTexture;
uniform float triPlanarScale;

void main_texture2D(in vec3 modelNormalIn, in vec3 modelPositionIn, out vec4 color) {
  vec3 blending = abs( normalize(modelNormalIn) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec4 xaxis = texture2D( triPlanarTexture, fract(modelPositionIn.zy * triPlanarScale));
  vec4 yaxis = texture2D( triPlanarTexture, fract(modelPositionIn.xz * triPlanarScale));
  vec4 zaxis = texture2D( triPlanarTexture, fract(modelPositionIn.xy * triPlanarScale));
  // blend the results of the 3 planar projections.
  vec4 tex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;

  color = tex;
}