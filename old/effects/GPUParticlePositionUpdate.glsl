#ifdef VERT

attribute vec2 position;
attribute vec2 texCoord;
uniform vec2 screenSize;
uniform vec2 pixelPosition;
uniform vec2 pixelSize;
varying vec2 vTexCoord;

void main() {
  float tx = position.x * 0.5 + 0.5;
  float ty = -position.y * 0.5 + 0.5;
  float x = (pixelPosition.x + pixelSize.x * tx)/screenSize.x * 2.0 - 1.0;  //0 -> -1, 1 -> 1
  float y = 1.0 - (pixelPosition.y + pixelSize.y * ty)/screenSize.y * 2.0;  //0 -> 1, 1 -> -1
  gl_Position = vec4(x, y, 0.0, 1.0);
  vTexCoord = texCoord;
}

#endif

#ifdef FRAG

varying vec2 vTexCoord;
uniform sampler2D particlePositions;
uniform sampler2D particleVelocities;
uniform sampler2D rgbd;
uniform vec3 restartPoint;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform float deltaTime;
uniform float gravity;
uniform float amount;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec4 pos = texture2D(particlePositions, vTexCoord);
  vec4 vel = texture2D(particleVelocities, vTexCoord);
  pos.xyz += vel.xyz * deltaTime;

  if (pos.y < bboxMin.y) {
    pos.y = bboxMin.y;
  }

  if (pos.a == 0.0) {
    pos.a = 1.0;
  }

  bool restart = pos.x <= bboxMin.x || pos.x >= bboxMax.x || pos.z <= bboxMin.z || pos.z >= bboxMax.z;
  restart = restart || gravity == 0.0;
  restart = restart || (pos.y < -1000.0 && length(vel) < 500.0);
  //restart = restart || (pos.y < 0.0);
  if (restart && rand(vTexCoord) < amount + 0.2) {
    pos = texture2D(rgbd, vec2(vTexCoord.x, vTexCoord.y*0.5));
    pos.a = 0.0;
  }
  gl_FragColor = pos;
}

#endif