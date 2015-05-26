#ifdef VERT

attribute vec4 position;
attribute vec2 texCoord;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * position;
  vTexCoord = texCoord;
}
#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D tex;
uniform float alpha;

void main() {
  //gl_FragColor = alpha * texture2D(tex, vec2(vTexCoord.x, 1.0 - vTexCoord.y));
  gl_FragColor = texture2D(tex, vec2(vTexCoord.x, 1.0 - vTexCoord.y));
}

#endif