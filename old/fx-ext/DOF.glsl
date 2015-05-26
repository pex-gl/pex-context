#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D color;
uniform sampler2D blurred;
uniform sampler2D depthMap;
uniform float near;
uniform float far;
uniform float fov;
uniform float aspectRatio;
uniform float focusDepth;
uniform float focusRange;
uniform float scale;
uniform mat4 invViewMatrix;

const float PI = 3.14159265358979323846;

float ndcDepthToEyeSpace(float ndcDepth) {
  return 2.0 * near * far / (far + near - ndcDepth * (far - near));
}

float readDepth(sampler2D depthMap, vec2 coord) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  return ndcDepthToEyeSpace(z_n);
}

vec3 getFarViewDir(vec2 tc) {
  float hfar = 2.0 * tan(fov/2.0/180.0 * PI) * far;
  float wfar = hfar * aspectRatio;
  vec3 dir = (vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -far));
  return dir;
}

vec3 reconstructPositionFromDepth(vec2 texCoord, float z) {
  vec3 ray = getFarViewDir(texCoord);
  vec3 pos = ray;
  return pos * z / far;
}

void main() {
  vec4 color = texture2D(color, vTexCoord).rgba;
  vec4 color2 = texture2D(blurred, vTexCoord).rgba;
  float depth = readDepth(depthMap, vTexCoord);

  vec3 reconstructedPosition = reconstructPositionFromDepth(vTexCoord, depth);
  vec4 reconstructedWorldPosition = invViewMatrix * vec4(reconstructedPosition, 1.0);
  reconstructedWorldPosition.xyz /= reconstructedWorldPosition.w;

  //color += scale * color2 * color2.a;

  gl_FragColor = 1.0 - (1.0 - color) * (1.0 - color2 * scale);

  float blur = smoothstep(0.0, focusRange, abs(focusDepth - reconstructedWorldPosition.z));

  //gl_FragColor = mix(color, color2, blur);
  gl_FragColor = color;

  //gl_FragColor = color;
  //gl_FragColor += 0.4 * color2;
  //gl_FragColor = vec4(blur);
  //gl_FragColor = vec4(-viewPos.bbb, 1.0);

  //gl_FragColor.rgba = color + scale * color2;
  //gl_FragColor.a = 1.0;
}

#endif