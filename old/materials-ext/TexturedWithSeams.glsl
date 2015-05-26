#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec2 texCoord;
attribute vec2 texCenter;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vTexCoord = texCoord + normalize(texCenter - texCoord) * 1.0/512.0;
}

#endif

#ifdef FRAG

uniform sampler2D texture;
varying vec2 vTexCoord;

void main() {
  //gl_FragColor = pow(texture2D(texture, vTexCoord), vec4(1.0/2.2));
  vec4 c = texture2D(texture, vTexCoord);
  //gl_FragColor = pow(c, vec4(1.0/1.0));
  c = c * vec4(1.0)/(vec4(1.0) + c);
  gl_FragColor = c;
  gl_FragColor = pow(c, vec4(1.0/2.2));
}

#endif
