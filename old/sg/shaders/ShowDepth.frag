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

void main_showDepth(in vec3 positionIn, out vec4 color) {
  float zEye = positionIn.z;
  float zNDC = eyeSpaceDepthToNDC(zEye);
  float zBuf = ndcDepthToDepthBuf(zNDC);

  color = vec4(zBuf);
}