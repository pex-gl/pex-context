#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vNormal = normal;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;
uniform sampler2D colorBands;
uniform float wrap;
varying vec3 vNormal;

void main() {
  vec3 L = normalize(lightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  gl_FragColor = ambientColor + NdotL * diffuseColor;
  gl_FragColor.rgb = N*0.5 + vec3(0.5);
  gl_FragColor.rgb = vec3(NdotL);

  gl_FragColor = texture2D(colorBands, vec2(NdotL, 0.5));
}

#endif
