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
uniform float exposure;

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  color.rgb *= exposure;
  vec3 x = max(vec3(0.0), color.rgb-vec3(0.004));
  vec3 retColor = (x*(6.2 * x + 0.5))/(x * (6.2 * x + 1.7) + 0.06);
  gl_FragColor.rgb = retColor;
  gl_FragColor.a = 1.0;
}

#endif