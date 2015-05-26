#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;

varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position.x, position.y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;

uniform sampler2D image;
uniform sampler2D image2;
uniform float fade;
uniform float brightness;
uniform float brightness2;

void main() {
  vec4 c1 = brightness * texture2D(image, vTexCoord);
  vec4 c2 = brightness2 * texture2D(image2, vTexCoord);
  gl_FragColor = mix(c1, c2, fade);
}

#endif
