#ifdef VERT

#define MAX_BONES 32

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform mat4 boneMatrices[MAX_BONES];

attribute vec3 position;
attribute vec3 normal;
attribute vec2 skinIndices;
attribute vec2 skinWeights;

varying vec3 ecPosition;

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

  vec4 ecPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * ecPos;
  gl_PointSize = pointSize;

  ecPosition = ecPos.xyz;
}

#endif

#ifdef FRAG

varying vec3 ecPosition;
uniform float near;
uniform float far;

//Z in Normalized Device Coordinates
//http://www.songho.ca/opengl/gl_projectionmatrix.html
float eyeSpaceDepthToNDC(float zEye) {
  float A = -(far + near) / (far - near); //projectionMatrix[2].z
  float B = -2.0 * far * near / (far - near); //projectionMatrix[3].z; //

  float zNDC = (A * zEye + B) / -zEye;
  return zNDC;
}

//depth buffer encoding
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToDepthBuf(float zNDC) {
  return 0.5 * zNDC + 0.5;
}

void main() {
  float zEye = ecPosition.z;
  float zNDC = eyeSpaceDepthToNDC(zEye);
  float zBuf = ndcDepthToDepthBuf(zNDC);

  gl_FragColor = vec4(zBuf);
}

#endif
