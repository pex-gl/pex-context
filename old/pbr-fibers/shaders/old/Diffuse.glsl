#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 viewMatrix;
uniform float pointSize;
uniform vec3 lightPos;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;
varying vec3 vLightPos;


void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = pointSize;
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform float wrap;
varying vec3 vNormal;
varying vec3 vLightPos;

void main() {
  vec3 L = normalize(vLightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  gl_FragColor = ambientColor + NdotL * diffuseColor;
}

#endif
