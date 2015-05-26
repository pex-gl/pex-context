struct VertData {
  vec3 positionVertex;
  vec3 positionWorld;
  vec4 positionProj;
  vec3 positionView;
  vec3 normalVertex;
  vec3 normalWorld;
  vec3 normalView;
  vec2 texCoord;
};

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;
attribute vec4 color;

uniform mat4 modelWorldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 viewMatrix;
uniform mat4 invViewMatrix;

uniform vec3 lightPos;

varying vec3 vPosition;
varying vec3 vPositionWorld;
varying vec3 vPositionView;
varying vec3 vNormal;
varying vec3 vNormalWorld;
varying vec3 vNormalView;
varying vec2 vTexCoord;

varying vec3 vLightPosView;