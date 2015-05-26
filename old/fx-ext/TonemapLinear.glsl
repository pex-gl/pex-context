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

void main() {
  vec4 color = texture2D(tex0, vTexCoord).rgba;
  //color.rgb *= 16.0; //hardcoded exposure
  vec3 retColor = pow(color.rgb, vec3(1.0/2.2)); //map gamma
  gl_FragColor.rgb = retColor;
  gl_FragColor.a = color.a;
}

#endif