#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vNormal = normal;
}

#endif

#ifdef FRAG

uniform sampler2D texture;
varying vec3 vNormal;

void main() {
  vec3 N = normalize(vNormal);
  vec2 texCoord = vec2((1.0 + atan(-N.z, N.x)/3.14159265359)/2.0, acos(-N.y)/3.14159265359);
  gl_FragColor = texture2D(texture, texCoord);
}

#endif
