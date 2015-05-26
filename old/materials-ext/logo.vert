uniform mat4 projectionMatrix;  // Projection.
uniform mat4 modelViewMatrix;  // Model view.

attribute vec3 position;

varying float size;

void main() {
	vec4 pos =  modelViewMatrix * vec4(position, 1.0);
	size = 5.0 * (1.0 - abs(pos.z)/20.0);
	//size = 1.0;
	//size = 10.0/100.0;
	gl_PointSize = size;
  gl_Position = projectionMatrix * pos;
	//gl_Position = vec4(0.15, 0.15, 0.0, 0.0);
}
