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
uniform float gravity;
uniform vec3 bboxMin;
uniform vec3 bboxMax;
uniform float deltaTime;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec4 pos = texture2D(particlePositions, vTexCoord);
  vec4 vel = texture2D(particleVelocities, vTexCoord);

  vel.y += gravity * deltaTime;

  if (abs(vel.y) >= 5.0 * abs(gravity)) {
    vel.y /= 5.0;
  }

  if (pos.a == 0.0) {
    vel.y = 0.0;
    vel.a = 0.0;
  }

  if (pos.y <= bboxMin.y && vel.y < 0.0) {
    vel.y = (0.75 - rand(vTexCoord)*0.5) * abs(vel.y);
    vel.a += 1.0;
  }

  gl_FragColor = vel;
}

#endif