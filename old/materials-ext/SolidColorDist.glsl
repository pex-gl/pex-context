#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
attribute vec3 position;
varying vec3 worldPos;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  worldPos = (modelWorldMatrix * vec4(position, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 color;
uniform vec3 center;
uniform float radius;
varying vec3 worldPos;

void main() {
  gl_FragColor = color;
  gl_FragColor.rgb *= color.a;
  float dist = distance(center, worldPos);
  if (dist < radius) {
     gl_FragColor.a = 1.0 - dist/radius;
  }
  else {
    gl_FragColor.a = 0.0;
  }
  gl_FragColor.rgb *= gl_FragColor.a;
}

#endif
