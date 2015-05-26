#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vTexCoord = normal;
}

#endif

#ifdef FRAG

uniform samplerCube texture;
varying vec3 vTexCoord;

void main() {
  gl_FragColor = textureCube(texture, vTexCoord);
}

#endif
