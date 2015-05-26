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
uniform float contrast;

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  gl_FragColor.rgb = (color.rgb - 0.5) * contrast + 0.5;
  gl_FragColor.a = color.a;
}

#endif