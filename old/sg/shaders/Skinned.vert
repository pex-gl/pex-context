attribute vec3 position;
attribute vec3 normal;

varying vec3 ecPosition;
varying vec3 mcPosition;
varying vec3 wcPosition;
varying vec3 ecNormal;
varying vec3 mcNormal;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;

#define MAX_BONES 32

uniform mat4 boneMatrices[MAX_BONES];
attribute vec2 skinIndices;
attribute vec2 skinWeights;

void main_skinned(out vec3 positionOut, out vec3 normalOut) {
  vec4 skinnedPosition = vec4(0.0);
  vec4 skinnedNormal = vec4(0.0);
  int idx1 = int(skinIndices.x);
  int idx2 = int(skinIndices.y);

  for(int i=0; i<MAX_BONES; i++) {
    if (i == idx1) { skinnedPosition += skinWeights.x * boneMatrices[i] * vec4(position, 1.0); }
    if (i == idx2) { skinnedPosition += skinWeights.y * boneMatrices[i] * vec4(position, 1.0); }
    if (i == idx1) { skinnedNormal += skinWeights.x * boneMatrices[i] * vec4(normal, 0.0); }
    if (i == idx2) { skinnedNormal += skinWeights.y * boneMatrices[i] * vec4(normal, 0.0); }
  }

  positionOut = skinnedPosition.xyz;
  normalOut = skinnedNormal.xyz;

  ecPosition = vec3(modelViewMatrix * vec4(skinnedPosition.xyz, 1.0));
  mcPosition = position.xyz;
  wcPosition = vec3(modelWorldMatrix * vec4(skinnedPosition.xyz, 1.0));
  ecNormal = normalize((normalMatrix * vec4(skinnedNormal.xyz, 1.0)).xyz);
  mcNormal = normal;
}