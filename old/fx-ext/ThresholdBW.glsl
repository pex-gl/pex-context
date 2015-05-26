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

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  luma += (1.0 - luma) * 0.55 * color.a * rand(vTexCoord);

  color.rgb = (luma > threshold) ? vec3(0.8) : vec3(0.0);

  gl_FragColor.rgb = color.rgb;
  gl_FragColor.a = color.r;
}

#endif