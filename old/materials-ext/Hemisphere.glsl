#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;
attribute vec3 position;

varying vec3 vPosition;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vPosition = position;
}

#endif

#ifdef FRAG

uniform vec4 skyColor;
uniform vec4 groundColor;
uniform bool premultiplied;

varying vec3 vPosition;

void main() {
  gl_FragColor.rgb = mix(groundColor.rgb, skyColor.rgb, vec3(min(1.0, max(0.0, vPosition.y+10.5) * 0.1)));
  gl_FragColor.a = 1.0;
}

#endif
