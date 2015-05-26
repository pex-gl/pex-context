uniform vec4 tintColor;

void main_tintColor(inout vec4 colorOut) {
  colorOut *= tintColor;
}