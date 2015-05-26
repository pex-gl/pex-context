#ifdef VERT

attribute vec3 position;
attribute vec2 texCoord;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform sampler2D texture;
uniform float pointSize;

uniform vec4 inputPositionRect;
uniform vec2 textureSize;
uniform vec4 depthRect;
uniform vec4 colorRect;
uniform mat4 channelMatrix[4];
uniform vec2 channelOffset[4];
uniform vec2 channelDepthRange[4];
uniform vec2 channelFov[4];
uniform bool channelEnabled[4];
uniform vec4 channelColor[4];
uniform bool debugMode;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform mat4 rotation;
uniform float groundLevel;

varying vec3 vDepth;
varying vec3 vColor;
varying float visibility;
varying vec3 vPosition;
varying float vEnabled;
varying float distanceToCenter;


void main() {
  gl_PointSize = pointSize;
  int channelId = int(position.z);
  vec2 depthTexCoord = vec2(
    (channelOffset[channelId].x + depthRect.x + depthRect.z * (position.x - inputPositionRect.x) / inputPositionRect.z)/textureSize.x, 
    1.0 - (channelOffset[channelId].y + depthRect.y + depthRect.w * (position.y - inputPositionRect.y) / inputPositionRect.w)/textureSize.y
  );
  vec2 colorTexCoord = vec2(
    (channelOffset[channelId].x + colorRect.x + colorRect.z * (position.x - inputPositionRect.x) / inputPositionRect.z)/textureSize.x, 
    1.0 - (channelOffset[channelId].y + colorRect.y + colorRect.w * (position.y - inputPositionRect.y) / inputPositionRect.w)/textureSize.y
  );
  vDepth = texture2D(texture, depthTexCoord).rgb;
  vColor = texture2D(texture, colorTexCoord).rgb;
  if (debugMode) {
    vColor = channelColor[channelId].rgb;
  }
  vec3 hsl = rgb2hsl(vDepth);
  float minDepth = channelDepthRange[channelId].x;
  float maxDepth = channelDepthRange[channelId].y;
  vec2 fov = channelFov[channelId];
  float depth = hsl2depth(hsl, minDepth, maxDepth);
  vec4 pos = uvd2xyzw(position.xy, vec2(inputPositionRect.z/4.0, inputPositionRect.w/4.0), depth, fov, 0.0);
  vPosition = position;
  vec4 wcPos = rotation * channelMatrix[channelId] * pos;
  gl_Position = projectionMatrix * modelViewMatrix * wcPos;
  visibility = hsl.z * 2.0;

  if ( wcPos.x < bboxMin.x || wcPos.y < bboxMin.y || wcPos.z < bboxMin.z
    || wcPos.x > bboxMax.x || wcPos.y > bboxMax.y || wcPos.z > bboxMax.z || wcPos.y < groundLevel) {
    visibility = 0.0;
  }

  vec3 center = (bboxMin + bboxMax) * 0.5;
  float size = length((bboxMax - center).xy) * 0.5;
  distanceToCenter = sqrt((wcPos.x - center.x) * (wcPos.x - center.x) + (wcPos.z - center.z) * (wcPos.z - center.z));
  distanceToCenter /= size;

  if (channelEnabled[channelId]) vEnabled = 1.0;
  else vEnabled = 0.0;
}

#endif

#ifdef FRAG

//uniform sampler2D texture;
varying vec3 vColor;
varying vec3 vDepth;
varying float visibility;
varying vec3 vPosition;
varying float vEnabled;
uniform float opacity;
uniform float highlight;
uniform bool texturedParticles;
uniform sampler2D particleTexture;
varying float distanceToCenter;

void main() {
	if (visibility < 0.75 || vEnabled < 0.5) discard;
  float light = 1.5;

  if (highlight > 0.0) {
    light = 0.5 + (1.0 - distanceToCenter) * highlight;
  }
  vec4 color = texture2D(particleTexture, gl_PointCoord.xy);
  if (!texturedParticles) {
    color = vec4(1.0);
  }
  gl_FragColor = opacity * color * vec4(vColor * light, 1.0);
  gl_FragColor.a = opacity * color.r;
  //if (length(gl_FragColor.rgb) < 0.01) {
    //discard;
  //}
  //gl_FragColor.a = opacity;
}

#endif
