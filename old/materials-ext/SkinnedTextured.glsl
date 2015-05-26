#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform mat4 boneMatrices[20];

attribute vec3 position;
attribute vec3 normal;
attribute vec2 skinIndices;
attribute vec2 skinWeights;
attribute vec2 texCoord;

varying vec3 e;
varying vec3 n;
varying vec3 wcCoords;
varying vec3 wcNormal;
varying vec2 vTexCoord;

void main() {
  vec4 skinnedPosition = vec4(0.0);
  vec4 skinnedNormal = vec4(0.0);
  int idx1 = int(skinIndices.x);
  int idx2 = int(skinIndices.y);

  for(int i=0; i<20; i++) {
    if (i == idx1) { skinnedPosition += skinWeights.x * boneMatrices[i] * vec4(position, 1.0); }
    if (i == idx2) { skinnedPosition += skinWeights.y * boneMatrices[i] * vec4(position, 1.0); }
    if (i == idx1) { skinnedNormal += skinWeights.x * boneMatrices[i] * vec4(normal, 0.0); }
    if (i == idx2) { skinnedNormal += skinWeights.y * boneMatrices[i] * vec4(normal, 0.0); }
  }

  vec3 pos = skinnedPosition.xyz;
  n = skinnedNormal.xyz;

  //http://graphics.ucsd.edu/courses/cse169_w05/3-Skin.htm
  //It is also important to recall that the normal vector represents a direction, rather than a position.
  //This implies that its expansion to 4D homogeneous coordinates should have a 0 in the value of the w coordinate, instead of a 1 as in the vertex position.
  //This ensures that the normal will only be affected by the upper 3x3 portion of the matrix, and not affected by any translation [see appendix [A]].
  e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
  wcCoords = (modelWorldMatrix * vec4(position, 1.0)).xyz;
  wcNormal = normal;

  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

uniform vec4 color;
uniform bool premultiplied;
varying vec2 vTexCoord;

uniform sampler2D texture;

void main() {
  gl_FragColor = color;
  float a = texture2D(texture, vTexCoord).a;
  //if (a < 0.5) discard;
  //gl_FragColor.rgba = vec4(1.0, 1.0, a, 1.0);

  gl_FragColor.rgba = vec4(a, a, a, 1.0);
}

#endif
