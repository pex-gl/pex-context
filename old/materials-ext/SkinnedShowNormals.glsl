#ifdef VERT

#define MAX_BONES 32

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform int arraySize;
uniform mat4 boneMatrices[MAX_BONES];

attribute vec3 position;
attribute vec3 normal;
attribute vec2 skinIndices;
attribute vec2 skinWeights;

varying vec4 vColor;

void main() {
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

  vec3 pos = skinnedPosition.xyz;
  vec3 n = skinnedNormal.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
  vec3 N = (normalMatrix * vec4(n, 1.0)).xyz;
  vColor = vec4(N * 0.5 + 0.5, 1.0);
}

#endif

#ifdef FRAG

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}

#endif
