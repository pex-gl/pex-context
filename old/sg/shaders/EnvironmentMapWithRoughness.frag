#define ROUGHNESS_SAMPLES 32

uniform samplerCube environmentMap;
uniform mat4 invViewMatrix;
uniform float specularRoughness;
uniform float specular;

vec3 rand3(vec3 p, int seed) {
  float a = 12.988;
  float b = 68.233;
  float c = 11.883;
  vec3 rv = normalize( vec3(a,b,c) + (float(seed)*0.987));
  float x = fract( sin( mod( dot( p, rv), 3.14)) * 43758.5453) * 2.0 - 1.0;
  float y = fract( sin( mod( dot( p, rv), 3.14)) * 19782.8974) * 2.0 - 1.0;
  float z = fract( sin( mod( dot( p, rv), 3.14)) * 61415.4067) * 2.0 - 1.0;
  return vec3(x, y, z);
}

//Based on
//http://antongerdelan.net/opengl/cubemaps.html
void main_environmentMap(in vec3 normalIn, in vec3 positionIn, inout vec4 color) {
  vec3 E = normalize(positionIn); //eye dir
  vec3 N = normalize(normalIn);
  vec3 wN = vec3(invViewMatrix * vec4(normalIn, 0.0));

  float specularRough = 1.0;

  vec3 cubeColor = vec3(0.0);
  for(int i=0; i<=ROUGHNESS_SAMPLES; i++ ) {
    vec3 R = reflect(E, N);
    R = vec3(invViewMatrix * vec4(R, 0.0));
    R = normalize((rand3( wN, i) * specularRoughness * specularRough) + R);
    cubeColor += textureCube(environmentMap, R).rgb / float(ROUGHNESS_SAMPLES);
  }

  color.rgb = mix(color.rgb, cubeColor, specular);
  //color
}