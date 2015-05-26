#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
uniform mat4 viewMatrix;
uniform vec3 lightPos;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord;

varying vec3 ecPosition;
varying vec3 ecNormal;
varying vec3 ecLightPos;
varying vec2 vTexCoord;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  ecPosition = vec3(modelViewMatrix * vec4(position, 1.0));
  ecNormal = vec3(normalMatrix * vec4(normal, 1.0));
  ecLightPos = vec3(viewMatrix * vec4(lightPos, 1.0));
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

uniform sampler2D colorBands;
varying vec3 ecPosition;
varying vec3 ecNormal;
varying vec3 ecLightPos;
varying vec2 vTexCoord;
uniform float shred;

void main() {
  vec3 L = normalize(ecLightPos - ecPosition);
  vec3 N = normalize(ecNormal);

  float NdotL = max(0.0, dot(N, L));

  gl_FragColor = texture2D(colorBands, vec2(NdotL, 0.5));

  //if (NdotL > 0.2 && NdotL < 0.5) gl_FragColor = vec4(1.0);
  if (shred > 0.0 && mod(vTexCoord.x, 0.2) > shred) {
    gl_FragColor = vec4(1.0);
  }

  //gl_FragColor = mix(gl_FragColor, vec4(1.0), shred);
}

#endif
