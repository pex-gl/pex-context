#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform vec4 fogColor;

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  vec4 depth = texture2D(tex1, vTexCoord).rgba;

  gl_FragColor = mix(color, fogColor, depth.r);
}

#endif