#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5; //-1 -> 0, 1 -> 1
  float ty = -position.y * 0.5 + 0.5; //-1 -> 1, 1 -> 0
  //(x + 0)/sw * 2 - 1, (x + w)/sw * 2 - 1
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1
  //1.0 - (y + h)/sh * 2, 1.0 - (y + h)/sh * 2
  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D colorMap;
uniform sampler2D depthMap;
uniform sampler2D normalMap;
uniform sampler2D positionMap;
uniform float near;
uniform float far;
uniform float fov;
uniform float aspectRatio;
uniform mat4 projectionMatrix;

float PI = 3.14159265359;

float hNear = 2.0 * tan(fov/180.0*PI/2.0) * near;
float wNear = hNear * aspectRatio;

float readDepth(sampler2D depthMap, vec2 coord) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  float z_e = 2.0 * near * far / (far + near - z_n * (far - near));
  return z_e;
  //return near + (far - near) * z_b;
  //return z_b;
  //float depth = z_b;
  //float depth = texture2D(depthMap, coord).r;
  //float A = projectionMatrix[2].z;
  //float B = projectionMatrix[3].z;
  //return 0.5*(-A*depth + B) / depth + 0.5;
  //float Znear = near;
  //float Zfar = far;
  //float Q  = Zfar / ( Zfar - Znear );
  //float inv_Zfar = 1.0 / Zfar;
  //float depth = texture2D(depthMap, coord).r;
  //float linearDepth = inv_Zfar / (Q - depth);
  //return linearDepth;
}

vec2 viewSpaceToScreenSpaceTexCoord(vec3 p) {
  vec4 projectedPos = projectionMatrix * vec4(p, 1.0);
  vec2 ndcPos = projectedPos.xy / projectedPos.w; //normalized device coordinates
  vec2 coord = ndcPos * 0.5 + 0.5;
  return coord;
}

vec3 screenSpaceTexCoordToViewSpace(vec2 coord) {
  float x = coord.x * 2.0 - 1.0;
  float y = coord.y * 2.0 - 1.0;
  x *= wNear / 2.0;
  y *= hNear / 2.0;
  return vec3(x, y, -near);
}

vec3 getViewSpaceRay(vec2 coord) {
  return normalize(screenSpaceTexCoordToViewSpace(coord));
}

vec3 getViewRay(vec2 tc) {
  float hfar = 2.0 * tan(fov/2.0/180.0 * PI) * far;
  float wfar = hfar * aspectRatio;
  vec3 ray = (vec3(wfar * (tc.x - 0.5), hfar * (tc.y - 0.5), -far));
  return ray;
}

//http://mynameismjp.wordpress.com/2010/09/05/position-from-depth-3/
//assumes z = len(ecPos.xyz)
vec3 reconstructPositionFromDepth(vec2 texCoord, float z) {
  vec3 ray = getViewRay(texCoord);
  return normalize(ray) * z;
}

void main() {
  vec4 color = texture2D(colorMap, vTexCoord);
  float normalizedDepth = texture2D(depthMap, vTexCoord).r;
  float depth = readDepth(depthMap, vTexCoord);
  vec3 normal = normalize(vec3(texture2D(normalMap, vTexCoord)) * 2.0 - 1.0);
  vec3 position = texture2D(positionMap, vTexCoord).xyz;

  //raymarch only surfaces marked in red
  //if (color.r > -1.0) {
  if (color.r > 0.99 && length(color) > 0.99) {
    vec3 basePos = reconstructPositionFromDepth(vTexCoord, depth);
    basePos = position;
    vec3 pos = basePos;

    vec3 I = normalize(pos);//incident vector //pos - camPos, but camPos is (0,0,0)
    vec3 R = normalize(reflect(I, normal));

    vec4 reflectionColor = vec4(0.0);

    float iterStep = 0.25;
    vec2 coord;
    for(int i=0; i<64; i++) {
      pos += R * iterStep;
      coord = viewSpaceToScreenSpaceTexCoord(pos);
      float pixelDepth = readDepth(depthMap, coord);
      if (-pos.z > pixelDepth) {
        pos -= R * iterStep;
        iterStep *= 0.5;
      }
    }
    coord = viewSpaceToScreenSpaceTexCoord(pos);
    reflectionColor = texture2D(colorMap, coord);

    float dist = distance(pos, basePos);
    float fade = 1.0 - clamp(dist, 0.0, 2.0)/2.0;
    fade = 1.0;
    color = vec4(0.2) + fade * 0.5 * reflectionColor;

    if (color.r > 0.99 && length(color) > 0.99) {
      color = vec4(0.0);
    }

    //vec2 screenCoord = viewSpaceToScreenSpaceTexCoord(basePos);
    //vec3 viewPos = screenSpaceTexCoordToViewSpace(screenCoord);
    //color += vec4(normalize(basePos).xy - normalize(viewPos).xy, 0.0, 1.0);

    //color = vec4(position - basePos, 1.0);
    //color = vec4(depth/20.0);
    //color = vec4(position/10.0, 1.0);
  }

  gl_FragColor = color;
}

#endif