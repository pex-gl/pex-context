#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec4 color;
varying float vY;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vY = position.y;
}

#endif

#ifdef FRAG

varying float vY;

void main() {
  float y = vY + 2.0;
  float layerDistance = 0.02;
  while(y > layerDistance) {
    y -= layerDistance;
  }
  y = max(0.0, y);
  float r = step(y, layerDistance/10.0);
  //float r = y/layerDistance;
  vec4 vColor = vec4(r, r, r, 1.0);
  gl_FragColor = vColor;
}

#endif
