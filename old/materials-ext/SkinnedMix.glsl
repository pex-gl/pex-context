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

varying vec3 e;
varying vec3 n;
varying vec3 wcCoords;
varying vec3 wcNormal;

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
}

#endif

#ifdef FRAG

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D textureMask;
varying vec3 e;
varying vec3 n;
varying vec3 wcCoords;
varying vec3 wcNormal;

void main() {
  float scale = 3.0;

  vec3 r = reflect(e, normalize(n));
  float m = 2.0 * sqrt(
    pow(r.x, 2.0) +
    pow(r.y, 2.0) +
    pow(r.z + 1.0, 2.0)
  );

  vec2 N = r.xy / m + 0.5;

  vec3 base1 = texture2D( texture1, N ).rgb;
  vec3 base2 = texture2D( texture2, N ).rgb;
  vec3 blending = abs( normalize(wcNormal) );
  blending = normalize(max(blending, 0.00001)); // Force weights to sum to 1.0
  float b = (blending.x + blending.y + blending.z);
  blending /= vec3(b, b, b);

  vec4 xaxis = texture2D( textureMask, wcCoords.zy * scale);
  vec4 yaxis = texture2D( textureMask, wcCoords.xz * scale);
  vec4 zaxis = texture2D( textureMask, wcCoords.xy * scale);

  // blend the results of the 3 planar projections.
  vec4 tex = xaxis * blending.x + yaxis * blending.y + zaxis * blending.z;
  float t = step(tex.r, 0.5);

  //float t = 1.0-tex.r;
  gl_FragColor = vec4( mix(base1, base2, t), 1.0 );

  //gl_FragColor = vec4(n*0.5 + 0.5, 1.0);
}

#endif
