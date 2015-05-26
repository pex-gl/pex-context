uniform sampler2D envMapReflection;
uniform sampler2D envMapDiffuse;
uniform mat4 invViewMatrix;
uniform float roughness;

//void main_envMap(in vec3 normalIn, inout vec4 color) {
//  vec3 N = normalize(normalIn);
//  vec2 coord = vec2((1.0 + atan(-N.z, N.x)/3.14159265359)/2.0, acos(N.y)/3.14159265359);
//  color = texture2D(envMap, coord);
//}

void main_environmentMap(in vec3 normalIn, in vec3 positionIn, out vec4 colorOut) {
  vec3 V = normalize(-positionIn); //eye dir
  vec3 N = reflect(V, normalIn); //reflecte vector
  N = vec3 (invViewMatrix * vec4(N, 0.0));
  vec2 coord = vec2((1.0 + atan(-N.z, N.x)/3.14159265359)/2.0, acos(N.y)/3.14159265359);
  vec4 reflection = texture2D(envMapReflection, coord);
  vec4 diffuse = texture2D(envMapDiffuse, coord);
  colorOut = mix(reflection, diffuse, roughness);
}