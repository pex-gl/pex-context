struct FragData {
  vec3 color;
  vec3 albedo;
  float opacity;
  float roughness;
  vec3 specularity;
  vec3 position;
  vec3 positionWorld;
  vec3 positionView;
  vec3 normalWorld;
  vec3 normalView;
  vec2 texCoord;
  vec3 eyePosView;
  vec3 eyeDirView;
  vec3 lightColor;
  float lightAtten;
  vec3 lightPosView;
  vec3 lightPosWorld;
  vec3 lightDirView;
  vec3 lightDirWorld;
  vec3 reflectionColor;
  vec3 irradianceColor;
  float exposure;
};

varying vec3 vPosition;
varying vec3 vPositionWorld;
varying vec3 vPositionView;
varying vec3 vNormalWorld;
varying vec3 vNormalView;
varying vec2 vTexCoord;

varying vec3 vLightPosView;

uniform vec3 lightPos;  //world coordinates
uniform vec4 lightColor;

uniform mat4 viewMatrix;
uniform mat4 invViewMatrix;

uniform float exposure;

//implementation specific uniforms

uniform vec4 albedoColor;
uniform sampler2D albedoMap;
uniform sampler2D glossinessMap;
uniform sampler2D specularityMap;
uniform float roughness;
uniform float specularity;

uniform samplerCube irradianceMap;
uniform samplerCube reflectionMap;
uniform float triplanarTextureScale;
//

float cubemapSize = 256.0;
float maxMipMapLevel = 8.0;

#define LOD_ENABLED

#ifdef LOD_ENABLED
#ifdef GL_ES
  #extension GL_EXT_shader_texture_lod : require
  #define textureCubeLod textureCubeLodEXT
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

#pragma glslify: correctGammaInput = require(./pbr/correctGammaInput.glsl)
#pragma glslify: correctGammaOutput = require(./pbr/correctGammaOutput.glsl)
#pragma glslify: sampleTexture2DTriPlanar = require(./pbr/sampleTexture2DTriPlanar.frag)
#pragma glslify: getFresnel = require(./pbr/fresnelSchlick.frag)
#pragma glslify: getLightDiffuse = require(./pbr/lightDiffuseLambert.frag)
#pragma glslify: getLightSpecular = require(./pbr/lightSpecularPhong.frag)
#pragma glslify: fixSeams = require(./pbr/fixSeams.glsl)
#pragma glslify: tonemapReinhard = require(./pbr/tonemapReinhard.glsl)

void getIrradiance(inout FragData data) {
  data.irradianceColor = textureCubeLod(irradianceMap, fixSeams(data.normalWorld, 0.0, cubemapSize), 0.0).rgb;
}

void getReflection(inout FragData data) {
  vec3 eyeDirWorld = vec3(invViewMatrix * vec4(data.eyeDirView, 0.0));
  vec3 reflectionWorld = reflect(-eyeDirWorld, data.normalWorld); //eye coordinates reflection vector

  float lod = data.roughness * maxMipMapLevel;
  float upLod = floor(lod);
  float downLod = ceil(lod);
  vec4 a = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, upLod, cubemapSize), upLod);
  vec4 b = textureCubeLod(reflectionMap, fixSeams(reflectionWorld, downLod, cubemapSize), downLod);

  data.reflectionColor = data.specularity * mix(a, b, lod - upLod).rgb;
}

void main() {
  FragData data;
  data.color = vec3(0.0);
  data.albedo = vec3(1.0);
  data.opacity = 1.0;
  data.position = vPosition;
  data.positionWorld = vPositionWorld;
  data.positionView = vPositionView;
  data.normalWorld = normalize(vNormalWorld);
  data.normalView = normalize(vNormalView);
  data.texCoord = vTexCoord;
  data.eyePosView = vec3(0.0, 0.0, 0.0);
  data.eyeDirView = normalize(data.eyePosView - data.positionView);
  data.lightAtten = 1.0;
  data.lightColor = correctGammaInput(lightColor.rgb);
  data.lightPosWorld = lightPos;
  data.lightPosView = vLightPosView;
  //data.lightDirWorld = normalize(-data.lightPosWorld);
  //data.lightDirView = normalize(data.lightPosView - vec3(viewMatrix * vec4(0.0, 0.0, 0.0, 1.0)));
  data.lightDirWorld = normalize(data.lightPosWorld - data.positionWorld);
  data.lightDirView = normalize(data.lightPosView - data.positionView);
  data.reflectionColor = vec3(0.0);
  data.exposure = exposure;

  //computation
  data.albedo = correctGammaInput(albedoColor.rgb);
  data.albedo = correctGammaInput(sampleTexture2DTriPlanar(data, albedoMap, triplanarTextureScale).rgb);
  data.roughness = roughness;
  data.roughness = 1.0 - correctGammaInput(sampleTexture2DTriPlanar(data, glossinessMap, triplanarTextureScale).rgb).r;
  data.specularity = vec3(specularity);
  data.specularity = correctGammaInput(sampleTexture2DTriPlanar(data, specularityMap, triplanarTextureScale).rgb);
  getFresnel(data);
  data.lightAtten *= getLightDiffuse(data);
  vec3 lightDiffuse = vec3(0.0);
  lightDiffuse = data.lightAtten * data.albedo * lightColor.rgb;
  data.lightAtten *= getLightSpecular(data);
  vec3 lightSpecular = vec3(0.0);
  lightSpecular = data.lightAtten * lightColor.rgb;

  data.color = mix(lightDiffuse, lightSpecular, data.specularity);

  getIrradiance(data);
  data.color = data.albedo * data.irradianceColor * (1.0 - data.specularity);

  getReflection(data);
  data.color += data.reflectionColor;

  data.color = tonemapReinhard(data.color, data.exposure);

  data.color = correctGammaOutput(data.color);


  gl_FragColor.rgb = data.color;
  gl_FragColor.a = data.opacity;
}
