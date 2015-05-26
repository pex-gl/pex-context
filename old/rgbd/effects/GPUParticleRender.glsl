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
uniform vec3 bboxMin;
uniform vec3 bboxMax;


void main() {
  vec3 pos = texture2D(particlePositions, texCoord).rgb;
  vColor = texture2D(particleVelocities, texCoord).rgb;

  wcPosition = (modelWorldMatrix * vec4(pos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(wcPosition, 1.0);
  float life = 1.0 - min(1.0, abs(pos.y / 300.0));
  gl_PointSize = pointSize + 2.0 * life;
  vTexCoord = texCoord;

  if (wcPosition.x <= bboxMin.x || wcPosition.x >= bboxMax.x || wcPosition.z <= bboxMin.z || wcPosition.z >= bboxMax.z || wcPosition.y < bboxMin.y) {
    gl_PointSize = 0.1;
    gl_Position = vec4(0.0);
  }
}

#endif

#ifdef FRAG

uniform sampler2D rgbd;
uniform vec4 color;
uniform vec3 lightPos;
uniform vec3 camPos;
uniform float lightRadius;
uniform vec4 particleColor;
uniform vec4 lightColor;
varying vec3 wcPosition;
varying vec2 vTexCoord;
varying vec3 vColor;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform bool debugMode;
uniform float opacity;

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

  //gl_FragColor.rgb += 0.1 * (wcPosition + 0.5);

  gl_FragColor.rgb += 0.3 * vec3(vTexCoord, 0.0);

  gl_FragColor = gl_FragColor.a * (texture2D(rgbd, vec2(vTexCoord.x, 0.5 + vTexCoord.y*0.5)) + 0.2);

  if (debugMode) {
    gl_FragColor = vec4(0.2, 0.4, 1.0, 1.0);
    if (wcPosition.x <= bboxMin.x || wcPosition.x >= bboxMax.x || wcPosition.z <= bboxMin.z || wcPosition.z >= bboxMax.z || wcPosition.y < bboxMin.y) {
     gl_FragColor = vec4(0.9, 0.4, 0.5, 1.0);
    }
  }

  gl_FragColor.a = opacity;

  if (length(gl_PointCoord.xy - 0.5) > 0.3) {
    //discard;
  }

  //vec4 depth = texture2D(rgbd, vec2(vTexCoord.s, 0.187 + vTexCoord.t*0.15));
  //vec4 color = texture2D(rgbd, vec2(vTexCoord.s, 0.68 + vTexCoord.t*0.15));
  //if (length(depth.rgb) < 0.005) discard;
  //else gl_FragColor = color;
}

#endif
