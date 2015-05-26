uniform float roughness;

void main_setAlpha(inout vec4 color) {
  color.a = roughness;
}