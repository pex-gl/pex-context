#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;

//position in eye space coordinates (camera space, view space)
varying vec3 ecPosition;

void main() {
  vec4 ecPos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * ecPos;

  ecPosition = ecPos.xyz;
}

#endif

#ifdef FRAG

varying vec3 ecPosition;
uniform float near;
uniform float far;

//Z in Normalized Device Coordinates
//http://www.songho.ca/opengl/gl_projectionmatrix.html
float eyeSpaceDepthToNDC(float zEye) {
  float A = -(far + near) / (far - near); //projectionMatrix[2].z
  float B = -2.0 * far * near / (far - near); //projectionMatrix[3].z; //

  float zNDC = (A * zEye + B) / -zEye;
  return zNDC;
}

//depth buffer encoding
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToDepthBuf(float zNDC) {
  return 0.5 * zNDC + 0.5;
}

void main() {
  float zEye = ecPosition.z;
  float zNDC = eyeSpaceDepthToNDC(zEye);
  float zBuf = ndcDepthToDepthBuf(zNDC);

  gl_FragColor = vec4(zBuf);
}

#endif
