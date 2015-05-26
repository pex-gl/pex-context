#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
uniform mat4[20] boneMatrices;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 skinIndices;
attribute vec2 skinWeights;
varying vec3 e;
varying vec3 n;

void main() {
  vec3 pos = position;
  mat4 matX = boneMatrices[int(skinIndices.x)];
  mat4 matY = boneMatrices[int(skinIndices.y)];
  pos = vec3(skinWeights.x * matX * vec4(pos, 1.0) + skinWeights.y *  matY * vec4(pos, 1.0));

  //http://graphics.ucsd.edu/courses/cse169_w05/3-Skin.htm
  //It is also important to recall that the normal vector represents a direction, rather than a position.
  //This implies that its expansion to 4D homogeneous coordinates should have a 0 in the value of the w coordinate, instead of a 1 as in the vertex position.
  //This ensures that the normal will only be affected by the upper 3x3 portion of the matrix, and not affected by any translation [see appendix [A]].
  n = normalize(vec3(normalMatrix * (skinWeights.x * matX * vec4(normal, 0.0) + skinWeights.y *  matY * vec4(normal, 0.0))));
  e = normalize(vec3(modelViewMatrix * vec4(pos, 1.0)));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
}

#endif

#ifdef FRAG

uniform sampler2D texture;

varying vec3 e;
varying vec3 n;

void main() {
  vec3 r = reflect(e, normalize(n));
  float m = 2.0 * sqrt(
    pow(r.x, 2.0) +
    pow(r.y, 2.0) +
    pow(r.z + 1.0, 2.0)
  );
  vec2 N = r.xy / m + 0.5;
  vec3 base = texture2D( texture, N ).rgb;
  gl_FragColor = vec4( base, 1.0 );
}

#endif
