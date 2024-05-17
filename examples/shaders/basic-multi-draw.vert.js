export default /* glsl */ `
#ifdef USE_MULTI_DRAW
  #extension GL_ANGLE_multi_draw: require
#endif

attribute vec3 aPosition;

#ifdef USE_INSTANCED_OFFSET
attribute vec3 aOffset;
#endif

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec4 vColor;

void main () {
  vec4 position = vec4(aPosition, 1.0);

  #ifdef USE_INSTANCED_OFFSET
    position.xyz += aOffset;
  #endif

#ifdef USE_MULTI_DRAW
  if (gl_DrawID == 0) {
    vColor = vec4(1.0, 0.5, 0.5, 1.0);
  } else if (gl_DrawID == 1) {
    vColor = vec4(0.5, 1.0, 0.5, 1.0);
  } else if (gl_DrawID == 2) {
    vColor = vec4(0.5, 0.5, 1.0, 1.0);
  } else {
    vColor = vec4(1.0, 1.0, 0.5, 1.0);
  }
#else
  vColor = vec4(1.0, 1.0, 1.0, 1.0);
#endif

  gl_Position = uProjectionMatrix * uViewMatrix * position;
}
`;
