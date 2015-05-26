#ifdef VERT

//screen image data
attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5; //-1 -> 0, 1 -> 1
  float ty = -position.y * 0.5 + 0.5; //-1 -> 1, 1 -> 0
  //(x + 0)/sw * 2 - 1, (x + w)/sw * 2 - 1
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1
  //1.0 - (y + h)/sh * 2, 1.0 - (y + h)/sh * 2
  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;

uniform sampler2D image;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;

uniform vec4 inputPositionRect;
uniform vec2 textureSize;
uniform vec4 depthRect;
uniform vec4 colorRect;
uniform mat4 channelMatrix[4];
uniform vec2 channelOffset[4];
uniform vec2 channelDepthRange[4];
uniform vec2 channelFov[4];
uniform vec4 channelColor[4];
uniform bool debugMode;
uniform vec3 bboxMin;
uniform vec3 bboxMax;

void main() {
  vec4 rawData;
  const int channelId = 0;//int(vTexCoord.x * 4.0);

  if (vTexCoord.y > 0.5) {
    vec2 tc = vec2(vTexCoord.x, vTexCoord.y * 2.0);
    rawData = texture2D(image, vTexCoord);
  }
  else {
    vec2 position = vec2(mod(vTexCoord.x*4.0,1.0) * inputPositionRect.z, (1.0 - vTexCoord.y * 2.0) * inputPositionRect.w);

    mat4 currentChannelMatrix = channelMatrix[0];
    vec2 currentChannelOffset = channelOffset[0];
    vec2 currentChannelDepthRange = channelDepthRange[0];
    vec2 currentChannelFov = channelFov[0];
    vec4 currentChannelColor = channelColor[0];

    if (vTexCoord.x < 0.25) {
      currentChannelMatrix = channelMatrix[0];
      currentChannelOffset = channelOffset[0];
      currentChannelDepthRange = channelDepthRange[0];
      currentChannelFov = channelFov[0];
      currentChannelColor = channelColor[0];
    }
    else if (vTexCoord.x < 0.5) {
      currentChannelMatrix = channelMatrix[1];
      currentChannelOffset = channelOffset[1];
      currentChannelDepthRange = channelDepthRange[1];
      currentChannelFov = channelFov[1];
      currentChannelColor = channelColor[1];
    }
    else if (vTexCoord.x < 0.75) {
      currentChannelMatrix = channelMatrix[2];
      currentChannelOffset = channelOffset[2];
      currentChannelDepthRange = channelDepthRange[2];
      currentChannelFov = channelFov[2];
      currentChannelColor = channelColor[2];
    }
    else {
      currentChannelMatrix = channelMatrix[3];
      currentChannelOffset = channelOffset[3];
      currentChannelDepthRange = channelDepthRange[3];
      currentChannelFov = channelFov[3];
      currentChannelColor = channelColor[3];
    }

    vec2 depthTexCoord = vec2(
      (currentChannelOffset.x + depthRect.x + depthRect.z * (position.x - inputPositionRect.x) / inputPositionRect.z)/textureSize.x, 
      1.0 - (currentChannelOffset.y + depthRect.y + depthRect.w * (position.y - inputPositionRect.y) / inputPositionRect.w)/textureSize.y
    );
    vec2 colorTexCoord = vec2(
      (currentChannelOffset.x + colorRect.x + colorRect.z * (position.x - inputPositionRect.x) / inputPositionRect.z)/textureSize.x, 
      1.0 - (currentChannelOffset.y + colorRect.y + colorRect.w * (position.y - inputPositionRect.y) / inputPositionRect.w)/textureSize.y
    );
    vec3 vDepth = texture2D(image, depthTexCoord).rgb;
    vec3 vColor = texture2D(image, colorTexCoord).rgb;
    if (debugMode) {
      vColor = currentChannelColor.rgb;
    }
    vec3 hsl = rgb2hsl(vDepth);

    float minDepth = currentChannelDepthRange.x;
    float maxDepth = currentChannelDepthRange.y;
    vec2 fov = currentChannelFov;
    float depth = hsl2depth(hsl, minDepth, maxDepth);
    vec4 pos = uvd2xyzw(position.xy, vec2(inputPositionRect.z/2.0, inputPositionRect.w/2.0), depth, fov, 0.0);
    vec4 wcPos = currentChannelMatrix * pos;

    if (depth > 0.0)
      rawData = vec4(1.0, 0.0, 0.0, 1.0);
    else
      rawData = vec4(1.0, 1.0, 0.0, 1.0);

    rawData = vec4(wcPos.xyz, 1.0);
  }
  gl_FragColor = rawData;
}

#endif
