uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;
attribute vec2 texCoord;

varying vec2 vTexCoord;

void main() {
	vTexCoord = texCoord;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
