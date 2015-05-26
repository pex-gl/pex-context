#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;

varying vec3 e;
varying vec3 n;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  e = normalize(vec3(modelViewMatrix * vec4(position, 1.0)));
  n = normalize(vec3(normalMatrix * vec4(normal, 1.0)));
}

#endif

#ifdef FRAG

uniform sampler2D texture;
uniform vec4 tintColor;

varying vec3 e;
varying vec3 n;

void main() {
  vec3 e2 = normalize(e);
  vec3 n2 = normalize(n);
  vec3 r = reflect(e2, n2);
  float m = 2.0 * sqrt(
    pow(r.x, 2.0) +
    pow(r.y, 2.0) +
    pow(r.z + 1.0, 2.0)
  );
  vec2 N = r.xy / m + 0.5;
  vec3 base = texture2D( texture, N ).rgb;
  base *= tintColor.rgb;
  gl_FragColor = vec4( base, 1.0 );
}

#endif
