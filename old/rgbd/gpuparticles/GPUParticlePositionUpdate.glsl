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
uniform vec3 restartPoint;

void main() {
  vec4 pos = texture2D(particlePositions, vTexCoord);
  vec4 vel = texture2D(particleVelocities, vTexCoord);
  pos.xyz += vel.xyz;
  if (pos.y < -0.5) {
    pos.y = -0.5;
  }
  if (abs(pos.x) >= 2.0 || abs(pos.z) >= 2.0) {
    pos.x = restartPoint.x;
    pos.z = restartPoint.z;
    pos.y = 2.0;
  }
  gl_FragColor = pos;
}

#endif