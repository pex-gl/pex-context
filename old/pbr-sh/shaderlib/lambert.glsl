float lambert(vec3 surfaceNormal, vec3 lightDir) {
  return max(0.0, dot(surfaceNormal, lightDir));
}
