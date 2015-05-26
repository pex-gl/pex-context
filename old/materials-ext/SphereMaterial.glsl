#ifdef VERT

attribute vec3 position;
attribute vec3 normal;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform mat4 normalMatrix;
varying vec3 vNormal;
varying vec3 wcPos;

void main() {
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
  //vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  wcPos = (modelWorldMatrix * vec4(position, 1.0)).xyz;
  gl_PointSize = 2.0;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 lightPos;
varying vec3 vNormal;
uniform float wrap;
varying vec3 wcPos;
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(lightPos);//normalize(lightPos - wcPos);
  float NdotL = max(0.0, (dot(N, L) + wrap)/(1.0 + wrap));
  gl_FragColor = vec4(1.0) - diffuseColor * NdotL;
  gl_FragColor *= gl_FragColor;
  gl_FragColor.rgb = vec3(pow((1.0 - NdotL), 2.0));
  gl_FragColor.a = 1.0;
}

#endif