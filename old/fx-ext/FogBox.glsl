//based on http://blenderartists.org/forum/showthread.php?184102-nicer-and-faster-SSAO and http://www.pasteall.org/12299
#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;

uniform mat4 viewMatrix;

varying vec2 vTexCoord;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;

uniform mat4 invViewMatrix;
uniform sampler2D colorMap;
uniform sampler2D depthMap;
uniform float near;
uniform float far;
uniform float fov;
uniform float aspectRatio;
uniform vec4 fogColor;
uniform float fogDensity;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogBoundingBoxMin;
uniform vec3 fogBoundingBoxMax;

const float PI = 3.14159265358979323846;


//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToEyeSpace(float ndcDepth) {
  return 2.0 * near * far / (far + near - ndcDepth * (far - near));
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
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

vec3 getViewRay(vec2 tc) {
  vec3 ray = normalize(getFarViewDir(tc));
  return ray;
}

//asumming z comes from depth buffer (ndc coords) and it's not a linear distance from the camera but
//perpendicular to the near/far clipping planes
//http://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/
//assumes z = eye space z
vec3 reconstructPositionFromDepth(vec2 texCoord, float z) {
  vec3 ray = getFarViewDir(texCoord);
  vec3 pos = ray;
  return pos * z / far;
}

float getFogDistanceCircle(vec3 position) {
  vec3 fogCenter = (fogBoundingBoxMin + fogBoundingBoxMax) / 2.0;
  float rX = abs(fogBoundingBoxMax.x - fogBoundingBoxMin.x) / 2.0;
  float rZ = abs(fogBoundingBoxMax.z - fogBoundingBoxMin.z) / 2.0;
  float dist = length(position - fogCenter);

  float shortestDistance = min(rX, rZ);
  dist = dist/shortestDistance;
  dist = (dist - fogStart)/(fogEnd - fogStart);
  dist = clamp(dist, 0.0, 1.0);
  return dist;
}

float getFogDistanceRect(vec3 position) {
  vec3 fogCenter = (fogBoundingBoxMin + fogBoundingBoxMax) / 2.0;
  float rX = abs(fogBoundingBoxMax.x - fogBoundingBoxMin.x) / 2.0;
  float rZ = abs(fogBoundingBoxMax.z - fogBoundingBoxMin.z) / 2.0;
  vec3 diff = abs(position - fogCenter);

  float dist = max(diff.x/rX, diff.z/rZ);
  dist = (dist - fogStart)/(fogEnd - fogStart);
  dist = clamp(dist, 0.0, 1.0);
  return dist;
}

void main() {
  float z = readDepth(depthMap, vTexCoord);
  //float z = texture2D(depthMap, vTexCoord).r;
  vec4 pixelColor = texture2D(colorMap, vTexCoord);

  const float LOG2 = 1.442695;
  //float d = (z - fogStart)/(fogEnd-fogStart);
  //d = clamp(d, 0.0, 1.0);

  vec3 ecPos = reconstructPositionFromDepth(vTexCoord, z);
  vec3 worldPos = vec3(invViewMatrix * vec4(ecPos, 1.0));
  float d = getFogDistanceRect(worldPos);

  //float fogFactor = exp2( -fogDensity * fogDensity * d * d * LOG2 );
  //float fogFactor = 1.0 - clamp( exp(-fogDensity * d), 0.0, 1.0);
  float fogFactor = 1.0 - clamp(exp(-pow(fogDensity*d, 2.0)), 0.0, 1.0);

  //fogFactor = clamp((fogFactor-fogStart)/(fogEnd-fogStart), 0.0, 1.0);

  //gl_FragColor = vec4((depth-near)/(far-near));
  gl_FragColor = mix(pixelColor, pow(fogColor, vec4(2.2)), fogFactor);

  //gl_FragColor = vec4(fogFactor);
  //gl_FragColor = vec4(ecPos.xyz/50.0, 1.0);
  //gl_FragColor = vec4(worldPos.xyz/50.0, 1.0);
  //gl_FragColor = vec4(vTexCoord, 0.0, 1.0);
  //gl_FragColor = vec4(reconstructPositionFromDepth(vTexCoord, z), 1.0);

  //gl_FragColor = vec4(z / 50.0);
}

#endif