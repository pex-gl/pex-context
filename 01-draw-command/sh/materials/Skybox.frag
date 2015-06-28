uniform samplerCube texture;
varying vec3 vNormal;

float maxMipMapLevel = 7.0;
float roughness = 0.5;
float cubemapSize = 256.0;

#define LOD_ENABLED

#ifdef LOD_ENABLED
#ifdef GL_ES
  #extension GL_EXT_shader_texture_lod : require
  #define textureCubeLod textureCubeLodEXT
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

#pragma glslify: tonemapReinhard=require(../lib/tonemap-reinhard)

vec3 fixSeams(vec3 vec, float mipmapIndex, float cubemapSize) {
  float scale = 1.0 - exp2(mipmapIndex) / cubemapSize;
  float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
  if (abs(vec.x) != M) vec.x *= scale;
  if (abs(vec.y) != M) vec.y *= scale;
  if (abs(vec.z) != M) vec.z *= scale;
  return vec;
}

vec3 getSkybox(samplerCube reflectionMap, vec3 reflectionWorld) {

  float lod = roughness * maxMipMapLevel;
  float upLod = floor(lod);
  float downLod = ceil(lod);
  upLod = 0.0;
  downLod = 0.0;
  vec4 a = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, upLod, cubemapSize), upLod);
  vec4 b = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, downLod, cubemapSize), downLod);

  return mix(a, b, lod - upLod).rgb;
}

void main() {
  float textureSize = 256.0;
  float level = 5.0;
  gl_FragColor.rgb = tonemapReinhard(getSkybox(texture, normalize(vNormal)), 1.0);
  gl_FragColor.a = 1.0;
}
