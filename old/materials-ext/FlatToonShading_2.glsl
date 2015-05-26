#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform float pointSize;
attribute vec3 position;
attribute vec3 normal;
varying vec3 vNormal;
varying float depth;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec4 ecPos = modelViewMatrix * vec4(position, 1.0);
  depth = length(ecPos);
  gl_PointSize = pointSize;
  vNormal = normal;
  vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}

#endif

#ifdef FRAG

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec4 fogColor;
uniform vec3 lightPos;
uniform sampler2D colorBands;
uniform float wrap;
uniform float near;
uniform float far;
varying vec3 vNormal;
varying vec3 ecPos;
varying float depth;

const float LOG2 = 1.442695;

void main() {
  vec3 L = normalize(lightPos);
  vec3 N = normalize(vNormal);
  float NdotL = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));
  gl_FragColor = ambientColor + NdotL * diffuseColor;
  gl_FragColor.rgb = N*0.5 + vec3(0.5);
  gl_FragColor.rgb = vec3(NdotL);

  vec4 color = texture2D(colorBands, vec2(NdotL, 0.5));
  float linearDepth = (depth-near-1.5)/(far-near);
  float fogDensity = 3.8;
  float exp2Fog = exp2(-linearDepth * linearDepth * fogDensity * fogDensity * LOG2);
  exp2Fog = clamp(exp2Fog, 0.0, 1.0);
  //gl_FragColor = mix(color, fogColor, linearDepth);
  gl_FragColor = mix(fogColor, color, exp2Fog);
  //gl_FragColor = vec4(linearDepth);
  //gl_FragColor = vec4(depth/10.0, 0.0, 0.0, 1.0);
  //gl_FragColor = vec4(normalize(lightPos)+0.5, 1.0);
  //gl_FragColor = vec4(NdotL, 1.0);
  //gl_FragColor = vec4(N + 0.5, 1.0);
  //gl_FragColor = vec4(L + 0.5, 1.0);
}

#endif
