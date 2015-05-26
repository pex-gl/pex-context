#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = position * vec3(1.0, 1.0, 1.0);
}

#endif

#ifdef FRAG

uniform samplerCube texture;
varying vec3 vNormal;

#extension GL_ARB_shader_texture_lod : require

float material_cubemapSize = 256;

vec3 fixSeams(vec3 vec, float mipmapIndex) {
    float scale = 1.0 - exp2(mipmapIndex) / material_cubemapSize;
    float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
    if (abs(vec.x) != M) vec.x *= scale;
    if (abs(vec.y) != M) vec.y *= scale;
    if (abs(vec.z) != M) vec.z *= scale;
    return vec;
}

void main() {
  vec3 N = normalize(vNormal);
  float lod = 0.5;
  float upLod = floor(lod);
  float downLod = ceil(lod);
  vec4 a = textureCubeLod(texture, fixSeams(N, upLod), upLod);
  vec4 b = textureCubeLod(texture, fixSeams(N, downLod), downLod);
  gl_FragColor = 0.85 * mix(a, b, lod - upLod);
}

#endif
