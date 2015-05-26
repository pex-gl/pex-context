float phong(vec3 lightDir, vec3 eyeDir, vec3 normal) {
  vec3 R = reflect(-lightDir, normal);
  return dot(R, eyeDir);
}
