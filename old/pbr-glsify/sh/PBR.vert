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
varying vec3 vNormalWorld;
varying vec3 vNormalView;
varying vec2 vTexCoord;

varying vec3 vLightPosView;

void transform(inout VertData data) {
  data.positionWorld = vec3(modelWorldMatrix * vec4(data.positionVertex, 1.0));
  data.positionView = vec3(modelViewMatrix * vec4(data.positionVertex, 1.0));
  data.positionProj = projectionMatrix * modelViewMatrix * vec4(data.positionVertex, 1.0);
  data.normalView = vec3(normalMatrix * vec4(data.normalVertex, 1.0));
  data.normalWorld = vec3(invViewMatrix * vec4(data.normalView, 0.0));
}

void main() {
  VertData data;
  data.positionVertex = position;
  data.normalVertex = normal;
  data.texCoord = texCoord;
  transform(data);

  gl_Position = data.positionProj;
  vPosition = position;
  vPositionView = data.positionView;
  vPositionWorld = data.positionWorld;
  vNormalView = data.normalView;
  vNormalWorld = data.normalWorld;
  vTexCoord = data.texCoord;

  vLightPosView = vec3(viewMatrix * vec4(lightPos, 1.0));
}
