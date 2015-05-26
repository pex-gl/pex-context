uniform sampler2D envMap;
uniform mat4 invViewMatrix;


void main_environmentMap(in vec3 normalIn, in vec3 positionIn, out vec4 colorOut) {
  vec3 V = normalize(-positionIn); //eye dir
  vec3 N = reflect(V, normalIn); //reflecte vector
  N = vec3 (invViewMatrix * vec4(N, 0.0));
  vec2 coord = vec2((1.0 + atan(-N.z, N.x)/3.14159265359)/2.0, acos(N.y)/3.14159265359);
  vec4 reflection = texture2D(envMap, coord);
  colorOut = reflection;
}