#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 ecNormal;
varying vec3 ecPos;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  ecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  ecNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}

#endif

#ifdef FRAG

#ifdef LOD_ENABLED
#ifdef WEBGL
  #extension GL_EXT_shader_texture_lod : require
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

uniform mat4 invViewMatrix;

uniform samplerCube texture;
uniform float lod;
varying vec3 ecNormal;
varying vec3 ecPos;

float material_cubemapSize = 256;

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / material_cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

vec3 fixSeams(vec3 vec) {
    float scale = 1.0 - 1.0 / material_cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

void main() {
  vec3 eyeDir = normalize(ecPos); //Direction to eye = camPos (0,0,0) - ecPos
  vec3 ecN = normalize(ecNormal);
  vec3 ecReflected = reflect(eyeDir, ecN); //eye coordinates reflection vector
  vec3 wcReflected = vec3(invViewMatrix * vec4(ecReflected, 0.0)); //world coordinates reflection vector

  wcReflected = normalize(wcReflected);

  #ifdef LOD_ENABLED
  float upLod = floor(lod);
  float downLod = ceil(lod);
  vec4 a = textureCubeLod(texture, fixSeams(wcReflected, upLod), upLod);
  vec4 b = textureCubeLod(texture, fixSeams(wcReflected, downLod), downLod);
  gl_FragColor = mix(a, b, lod - upLod);
  //gl_FragColor += vec4(0.8, 0.0, 0.0, 0.0);
  #else
  gl_FragColor = textureCube(texture, wcReflected);
  #endif
}

#endif
