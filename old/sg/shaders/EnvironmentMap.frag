uniform samplerCube environmentMap;
uniform mat4 invViewMatrix;

//Based on
//http://antongerdelan.net/opengl/cubemaps.html
void main_environmentMap(in vec3 normalIn, in vec3 positionIn, out vec4 colorOut) {
  vec3 V = normalize(positionIn); //eye dir
  vec3 R = reflect(V, normalIn); //reflecte vector
  R = vec3 (invViewMatrix * vec4(R, 0.0));
  colorOut = textureCube(environmentMap, R);
}