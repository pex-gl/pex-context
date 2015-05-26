#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelWorldMatrix;

attribute vec3 position;
attribute vec2 texCoord;

varying vec4 vColor;
varying vec3 wcPosition;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  wcPosition = (modelWorldMatrix * vec4(position, 1.0)).xyz;
  vColor = vec4(texCoord, 1.0, 1.0);
}

#endif

#ifdef FRAG

uniform float near;
uniform float far;
uniform mat4 invViewMatrix;
uniform vec3 camPos;

varying vec4 vColor;
varying vec3 wcPosition;

bool debug = false;

float PI = 3.14159265;
vec2 screenSize = vec2(1280.0, 720.0);
float fov = 60.0;
float aspectRatio = screenSize.x / screenSize.y;
float hNear = 2.0 * tan(fov/180*PI / 2.0) * near;
float wNear = hNear * aspectRatio;

vec3 center = vec3(0.0, 0.0, 0.0);
vec3 size = vec3(2.0, 2.0, 2.0);
vec3 corner = center - size/2.0;

uniform sampler2D octree;

float textureWidth = 64.0;
float textureHeight = 64.0;
vec2 texel = vec2(1.0 / textureWidth, 1.0 / textureHeight);


float maxcomp(vec3 p) {
  return max(p.x, max(p.y, p.z));
}

//p - current point
//b - box radius
float box(vec3 p, vec3 b) {
  vec3  di = abs(p) - b;
  float mc = maxcomp(di);
  return min(mc, length(max(di, 0.0)));
}

float centerbox(vec3 p, vec3 center, vec3 size) {
  return box(p - center, size/2.0);
}

vec4 scene(vec3 p) {
  float d1 = centerbox(p, vec3( 0.5,  0.5,  0.5), vec3(1.0));
  float d2 = centerbox(p, vec3(-0.5,  0.5, -0.5), vec3(1.0));
  float d3 = centerbox(p, vec3( 0.5, -0.5, -0.5), vec3(1.0));
  float d4 = centerbox(p, vec3(-0.5, -0.5,  0.5), vec3(1.0));
  float d = min(d1, min(d2, min(d3, d4)));
  if (d == d1) return vec4(1.0, 0.0, 0.0, d);
  if (d == d2) return vec4(0.0, 1.0, 0.0, d);
  if (d == d3) return vec4(0.0, 0.0, 1.0, d);
  if (d == d4) return vec4(1.0, 0.0, 1.0, d);
}

vec4 sceneOctree2(vec3 p, vec2 cellAddress, vec3 cellCenter, vec3 cellSize) {
  vec2 childAddress[8];
  childAddress[0] = cellAddress + vec2(0.0, 0.0) * texel;
  childAddress[1] = cellAddress + vec2(1.0, 0.0) * texel;
  childAddress[2] = cellAddress + vec2(2.0, 0.0) * texel;
  childAddress[3] = cellAddress + vec2(3.0, 0.0) * texel;
  childAddress[4] = cellAddress + vec2(4.0, 0.0) * texel;
  childAddress[5] = cellAddress + vec2(5.0, 0.0) * texel;
  childAddress[6] = cellAddress + vec2(6.0, 0.0) * texel;
  childAddress[7] = cellAddress + vec2(7.0, 0.0) * texel;

  vec3 childPositionOffsets[8];
  childPositionOffsets[0] = vec3(-0.25,-0.25,-0.25);
  childPositionOffsets[1] = vec3( 0.25,-0.25,-0.25);
  childPositionOffsets[2] = vec3(-0.25,-0.25, 0.25);
  childPositionOffsets[3] = vec3( 0.25,-0.25, 0.25);
  childPositionOffsets[4] = vec3(-0.25, 0.25,-0.25);
  childPositionOffsets[5] = vec3( 0.25, 0.25,-0.25);
  childPositionOffsets[6] = vec3(-0.25, 0.25, 0.25);
  childPositionOffsets[7] = vec3( 0.25, 0.25, 0.25);

  vec3 childSize = cellSize / 2.0;

  float minChildDistance = 9999999.0;
  vec3 minChildColor;

  for(int i=0; i<8; i++) {
    float childDistance = centerbox(p, cellCenter + childPositionOffsets[i] * cellSize, childSize);
    if (childDistance < minChildDistance) {
      vec4 childColor = texture2D(octree, cellAddress + childAddress[i]);
      if (childColor.a > 0.0) {
        minChildColor = childColor.rgb;
        minChildDistance = childDistance;
      }
    }
  }

  return vec4(minChildColor, minChildDistance);
}

vec4 sceneOctree(vec3 p) {
  vec2 cellAddress = vec2(0.0, 0.0);
  vec3 cellCenter = vec3(0.0, 0.0, 0.0);
  vec3 cellSize = vec3(2.0, 2.0, 2.0);

  vec2 childAddress[8];
  childAddress[0] = cellAddress + vec2(0.0, 0.0) * texel;
  childAddress[1] = cellAddress + vec2(1.0, 0.0) * texel;
  childAddress[2] = cellAddress + vec2(2.0, 0.0) * texel;
  childAddress[3] = cellAddress + vec2(3.0, 0.0) * texel;
  childAddress[4] = cellAddress + vec2(4.0, 0.0) * texel;
  childAddress[5] = cellAddress + vec2(5.0, 0.0) * texel;
  childAddress[6] = cellAddress + vec2(6.0, 0.0) * texel;
  childAddress[7] = cellAddress + vec2(7.0, 0.0) * texel;

  //vec3 childSize = vec3(1.0 / pow(2.0, depthLevel));

  vec3 childPositionOffsets[8];
  childPositionOffsets[0] = vec3(-0.25,-0.25,-0.25);
  childPositionOffsets[1] = vec3( 0.25,-0.25,-0.25);
  childPositionOffsets[2] = vec3(-0.25,-0.25, 0.25);
  childPositionOffsets[3] = vec3( 0.25,-0.25, 0.25);
  childPositionOffsets[4] = vec3(-0.25, 0.25,-0.25);
  childPositionOffsets[5] = vec3( 0.25, 0.25,-0.25);
  childPositionOffsets[6] = vec3(-0.25, 0.25, 0.25);
  childPositionOffsets[7] = vec3( 0.25, 0.25, 0.25);

  vec3 childSize = cellSize / 2.0;

  float minChildDistance = 9999999.0;
  vec3 minChildColor;

  for(int i=0; i<8; i++) {
    vec3 childCenter = cellCenter + childPositionOffsets[i] * cellSize;
    float childDistance = centerbox(p, childCenter, childSize);
    if (childDistance < minChildDistance) {
      vec4 childColor = texture2D(octree, cellAddress + childAddress[i]);
      if (childColor.a >0.9) {
        minChildColor = childColor.rgb;
        minChildDistance = childDistance;
      }
      else if (childColor.a > 0.4) {
        vec4 childValue = sceneOctree2(p, childAddress[i], childCenter, childSize);
        if (childValue.a < minChildDistance) {
          minChildDistance = childValue.a;
          minChildColor = childValue.rgb;
        }
      }
    }
  }

  return vec4(minChildColor, minChildDistance);
}

void main() {
  vec3 rayOrigin = camPos;
  vec3 rayDir = normalize(wcPosition - camPos);
  vec3 p;
  vec3 L = normalize(vec3(2.0, 10.0, 10.0));

  float step = 0.05;
  vec3 color = vec3(0.5, 0.5, 0.5);
  vec3 eps = vec3(0.02, 0.0, 0.0);

  int i = 0;
  for(float t=near; t<far; t+=step) {
    i++;
    t += step;
    p = rayOrigin + rayDir * t;
    vec4 d = sceneOctree(p);

    if (d.a <= 0.000) {
      color = d.rgb;
      vec3 n = vec3(
        scene(p + eps.xyy).a - scene(p - eps.xyy).a,
        scene(p + eps.yxy).a - scene(p - eps.yxy).a,
        scene(p + eps.yyx).a - scene(p - eps.yyx).a
      );
      vec3 N = normalize(n);
      float diffuse = (dot(N, L) + 1.0) / 2.0;
      color *= 0.5 + 0.5 * diffuse;
      break;
    }
    else {
      step = max(0.005, d.a * 0.5);
    }
  }

  if (debug) {
    color = vec3(0.0, 1.0, 0.0);
    if (i > 20) color = vec3(1.0, 1.0, 0.0);
    if (i > 40) color = vec3(1.0, 0.0, 0.0);
    color = vec3(i/64.0, 0.0, 0.0);
  }

  gl_FragColor.rgb = color;
}


#endif