#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
varying vec4 vColor;
void main() {
  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * pos;
  vColor = pos;
}

#endif

#ifdef FRAG

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}

#endif
