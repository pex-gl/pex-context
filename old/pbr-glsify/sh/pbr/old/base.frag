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

float cubemapSize = 256.0;
float maxMipMapLevel = 8.0;
