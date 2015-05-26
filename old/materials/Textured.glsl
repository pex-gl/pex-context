#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 offset;
uniform float pointSize;
attribute vec3 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vTexCoord = texCoord;
  vTexCoord += offset;
  gl_PointSize = pointSize;
}

#endif

#ifdef FRAG

uniform sampler2D texture;
uniform vec2 scale;
uniform vec4 color;
varying vec2 vTexCoord;

void main() {
  gl_FragColor = texture2D(texture, vTexCoord * scale) * color;
}

#endif
