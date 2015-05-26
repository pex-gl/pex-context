#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;
uniform float pointSize;
uniform sampler2D particlePositions;
uniform sampler2D particleVelocities;
attribute vec3 position;
attribute vec2 texCoord;
varying vec3 wcPosition;
varying vec2 vTexCoord;
varying vec3 vColor;

void main() {
  vec3 pos = texture2D(particlePositions, texCoord).rgb;
  vColor = texture2D(particleVelocities, texCoord).rgb;

  wcPosition = (modelWorldMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = pointSize;
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

uniform vec4 color;
uniform vec3 lightPos;
uniform vec3 camPos;
uniform float lightRadius;
uniform vec4 particleColor;
uniform vec4 lightColor;
varying vec3 wcPosition;
varying vec2 vTexCoord;
varying vec3 vColor;

void main() {
  gl_FragColor = color;
  gl_FragColor.rgb *= color.a;
  gl_FragColor.rgba = vec4(vTexCoord, 0.0, 1.0);

  vec3 L = lightPos - wcPosition;
  vec3 V = camPos - wcPosition;
  float lightDistance = length(L);
  float d = 1.0;
  if (lightDistance > lightRadius) {
    gl_FragColor.rgba = particleColor;
  }
  else {
    float k = 1.0 - lightDistance/lightRadius;
    d = max(0.0, dot(normalize(L), normalize(V)));
    k *= d;
    gl_FragColor.rgba = mix(particleColor, lightColor, k);
  }

  gl_FragColor.rgb += 0.1 * (wcPosition + 0.5);

  gl_FragColor.rgb += 0.3 * vec3(vTexCoord, 0.0);
}

#endif
