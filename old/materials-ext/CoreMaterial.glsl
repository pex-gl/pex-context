#ifdef VERT

attribute vec3 position;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
varying vec3 vNormal;

void main() {
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 2.0;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;
varying vec3 vNormal;
uniform float wrap;
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(lightPos);
  float NdotL = max(0.0, (dot(N, L) + wrap)/(1.0 + wrap));
  gl_FragColor = vec4(1.0) - diffuseColor * NdotL;
  gl_FragColor *= gl_FragColor;
  gl_FragColor.a = 1.0;
}

#endif