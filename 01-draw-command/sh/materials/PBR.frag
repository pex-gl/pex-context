uniform samplerCube texture;
uniform mat4 invViewMatrix;
varying vec3 vNormal;
varying vec3 normalView;
varying vec3 normalWorld;
varying vec3 positionWorld;
varying vec3 positionView;

float maxMipMapLevel = 7.0;
float roughness = 0.9;
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
#pragma glslify: snoise3=require(glsl-noise/simplex/3d)

vec3 fixSeams(vec3 vec, float mipmapIndex, float cubemapSize) {
  float scale = 1.0 - exp2(mipmapIndex) / cubemapSize;
  float M = max(max(abs(vec.x), abs(vec.y)), abs(vec.z));
  if (abs(vec.x) != M) vec.x *= scale;
  if (abs(vec.y) != M) vec.y *= scale;
  if (abs(vec.z) != M) vec.z *= scale;
  return vec;
}

vec3 getReflection(samplerCube reflectionMap, vec3 eyeDirView) {
  vec3 eyeDirWorld = vec3(invViewMatrix * vec4(eyeDirView, 0.0));
  vec3 reflectionWorld = reflect(-eyeDirWorld, normalize(normalWorld)); //eye coordinates reflection vector

  float lod = roughness * maxMipMapLevel;
  float upLod = floor(lod);
  float downLod = ceil(lod);
  vec4 a = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, upLod, cubemapSize), upLod);
  vec4 b = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, downLod, cubemapSize), downLod);

  return mix(a, b, lod - upLod).rgb;
}

void main() {
  //roughness = (positionView.y + 1.0);
  roughness = smoothstep(0.29, 0.31, 0.3 + 0.3 * snoise3(4.0*positionWorld));
  vec3 eyePosView = vec3(0.0, 0.0, 0.0);
  vec3 eyeDirView = normalize(eyePosView - positionView);
  float textureSize = 256;
  float level = 5.0;
  gl_FragColor.rgb = tonemapReinhard(getReflection(texture, normalize(eyeDirView)), 1.0);
  gl_FragColor.a = 1.0;
  //gl_FragColor.rgb = normalWorld * 0.5 + 0.5;
  //gl_FragColor.rgb = normalView * 0.5 + 0.5;
  //gl_FragColor.rgb = vNormal * 0.5 + 0.5;
}
