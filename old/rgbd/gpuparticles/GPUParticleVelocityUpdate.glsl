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

void main() {
  vec4 pos = texture2D(particlePositions, vTexCoord);
  vec4 vel = texture2D(particleVelocities, vTexCoord);
  if (pos.y >= 2.0) {
    vel.y = 0.0;
    vel.x *= 0.95;
    vel.z *= 0.95;
  }
  vel.y -= 0.001;
  if (pos.y <= -0.5 && vel.y < 0.0) {
    vel.y = 0.8 * abs(vel.y);
    vel.xz *= 1.5;
  }

  gl_FragColor = vel;
}

#endif