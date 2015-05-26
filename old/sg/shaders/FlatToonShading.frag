uniform sampler2D colorBands;

void main_flatToonShading(in vec3 normal, out vec4 color) {
  vec3 L = normalize(vec3(0.0, 10.0, 10.0));
  vec3 N = normalize(normal);
  float wrap = 1.0;

  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  color = texture2D(colorBands, vec2(NdotL, 0.5));
}