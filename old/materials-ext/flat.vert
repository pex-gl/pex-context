uniform mat4 projectionMatrix;

attribute vec2 position;
attribute vec2 texCoord;

varying vec2 vTexCoord;

void main() {
	vTexCoord = texCoord;
  gl_Position = projectionMatrix * vec4(position, 1.0, 1.0);
	//gl_Position.z = 0;
	//gl_Position.w = 1.0;
}
