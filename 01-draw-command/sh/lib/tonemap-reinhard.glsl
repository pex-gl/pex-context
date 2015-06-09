vec3 tonemapReinhard(vec3 color, float exposure) {
  vec3 c = color * exposure;
  return c / (1.0 + c);
}

#pragma glslify: export(tonemapReinhard)
