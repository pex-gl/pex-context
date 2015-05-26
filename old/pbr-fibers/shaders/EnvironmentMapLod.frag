#extension GL_ARB_shader_texture_lod : require

uniform samplerCube environmentMap;
uniform mat4 invViewMatrix;

uniform float roughness;
uniform vec4 color;

//Based on
//http://antongerdelan.net/opengl/cubemaps.html
void main_environmentMapLod(in vec3 normalIn, in vec3 positionIn, out vec4 colorOut) {
  vec3 V = normalize(positionIn); //eye dir
  vec3 R = reflect(V, normalIn); //reflecte vector
  R = vec3 (invViewMatrix * vec4(R, 0.0));
  //colorOut = textureCubeLod(environmentMap, R, 8.0 * (roughness));
  colorOut = textureCubeLod(environmentMap, R, 10.0);
  //colorOut = textureCube(environmentMap, R);
  //colorOut = vec4(1.0, roughness, 0.0, 1.0);
  //colorOut *= color;
  //colorOut = color + pow(colorOut, vec4(1.0/2.2));
  //colorOut = textureCube(environmentMap, R);
}