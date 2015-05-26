uniform sampler2D texture;

void main_texture2D(in vec2 texCoord, out vec4 color) {
  color = texture2D(texture, texCoord);
}