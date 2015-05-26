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
uniform float threshold;
uniform vec2 r;
uniform vec2 g;
uniform vec2 b;

void main() {
  float aValue = texture2D(tex0, vTexCoord).a;
  float rValue = texture2D(tex0, vTexCoord + r).r;
  float gValue = texture2D(tex0, vTexCoord + g).g;
  float bValue = texture2D(tex0, vTexCoord + b).b;

  gl_FragColor = vec4(rValue, gValue, bValue, aValue);
}

#endif