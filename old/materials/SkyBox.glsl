#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = position * vec3(1.0, 1.0, 1.0);
}

#endif

#ifdef FRAG

uniform samplerCube texture;
varying vec3 vNormal;

void main() {
  vec3 N = normalize(vNormal);
  gl_FragColor = textureCube(texture, N);
}

#endif
