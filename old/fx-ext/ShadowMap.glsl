//based on http://blenderartists.org/forum/showthread.php?184102-nicer-and-faster-SSAO and http://www.pasteall.org/12299
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

uniform sampler2D colorMap;
uniform sampler2D depthMap;
uniform sampler2D normalMap;
uniform float camNear;
uniform float camFar;
uniform float camFov;
uniform float camAspectRatio;
uniform mat4 camViewMatrix;
uniform mat4 camInvViewMatrix;
uniform mat4 camProjectionMatrix;

uniform sampler2D lightDepthMap;
uniform float lightNear;
uniform float lightFar;
uniform float lightFov;
uniform float lightAspectRatio;
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;
uniform vec3 lightPos;

uniform float bias;

const float PI = 3.14159265358979323846;

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToEyeSpace(float ndcDepth, float near, float far) {
  return 2.0 * near * far / (far + near - ndcDepth * (far - near));
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float readDepth(sampler2D depthMap, vec2 coord, float near, float far) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  return ndcDepthToEyeSpace(z_n, near, far);
}

vec3 getFarViewDir(vec2 tc, float fov, float aspectRatio, float far) {
  float hfar = 2.0 * tan(fov/2.0/180.0 * PI) * far;
  float wfar = hfar * aspectRatio;
  vec3 dir = (vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -far));
  return dir;
}

vec3 getViewRay(vec2 tc, float fov, float aspectRatio, float far) {
  vec3 ray = normalize(getFarViewDir(tc, fov, aspectRatio, far));
  return ray;
}

//asumming z comes from depth buffer (ndc coords) and it's not a linear distance from the camera but
//perpendicular to the near/far clipping planes
//http://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/
//assumes z = eye space z
vec3 reconstructPositionFromDepth(vec2 texCoord, float z, float fov, float aspectRatio, float far) {
  vec3 ray = getFarViewDir(texCoord, fov, aspectRatio, far);
  vec3 pos = ray;
  return pos * z / far;
}

vec2 ecPosToScreenTexCoord(vec3 ecPos, mat4 projectionMatrix) {
  vec4 projPos = projectionMatrix * vec4(ecPos, 1.0);
  return (projPos.xy/projPos.w + 1.0)/2.0;
}

void main() {
  float ecZ = readDepth(depthMap, vTexCoord, camNear, camFar);
  vec4 pixelColor = texture2D(colorMap, vTexCoord);
  vec3 ecN = normalize(texture2D(normalMap, vTexCoord).rgb - 0.5);
  vec3 ecPos = reconstructPositionFromDepth(vTexCoord, ecZ, camFov, camAspectRatio, camFar);
  vec4 worldPos = camInvViewMatrix * vec4(ecPos, 1.0);

  vec3 ecLightPos = vec3(camViewMatrix * vec4(lightPos, 1.0));
  vec3 ecL = normalize(ecLightPos - ecPos);

  vec3 lightecPos = vec3(lightViewMatrix * vec4(worldPos.xyz, 1.0));
  vec2 lightCoord = ecPosToScreenTexCoord(lightecPos, lightProjectionMatrix);
  float lightEcZ = readDepth(lightDepthMap, lightCoord, lightNear, lightFar);

  float lightDepth1 = lightEcZ / lightFar;
  float lightDepth2 = -lightecPos.z / lightFar;

  float illuminated = step(lightDepth2, lightDepth1+bias);

  float NdotL = dot(ecL, ecN);
  NdotL = clamp(NdotL, 0.0, 1.0);

  illuminated *= NdotL;

  //if (lightCoord.x < 0.0) { illuminated = NdotL; }
  //if (lightCoord.x > 1.0) { illuminated = NdotL; }
  //if (lightCoord.y < 0.0) { illuminated = NdotL; }
  //if (lightCoord.y > 1.0) { illuminated = NdotL; }
  if (lightCoord.x < 0.2) { illuminated =  1.0 - (1.0 - illuminated) * smoothstep(0.0, 0.2, lightCoord.x); }
  if (lightCoord.x > 0.8) { illuminated =  1.0 - (1.0 - illuminated) * smoothstep(1.0, 0.8, lightCoord.x); }
  if (lightCoord.y < 0.2) { illuminated =  1.0 - (1.0 - illuminated) * smoothstep(0.0, 0.2, lightCoord.y); }
  if (lightCoord.y > 0.8) { illuminated =  1.0 - (1.0 - illuminated) * smoothstep(1.0, 0.8, lightCoord.y); }

  gl_FragColor = pixelColor * (0.1 + 0.9 * illuminated);

  //gl_FragColor = vec4(lightDepth2);
}

#endif