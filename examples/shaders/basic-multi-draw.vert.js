export default /* glsl */ `
#if defined(USE_MULTI_DRAW) || defined(USE_MULTI_DRAW_INSTANCED_BASE)
  #extension GL_ANGLE_multi_draw: require
#else
  uniform highp int uDrawID;
  #define gl_DrawID uDrawID
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

  if (gl_DrawID == 0) {
    vColor = vec4(1.0, 0.5, 0.5, 1.0);
  } else if (gl_DrawID == 1) {
    vColor = vec4(0.5, 1.0, 0.5, 1.0);
  } else if (gl_DrawID == 2) {
    vColor = vec4(0.5, 0.5, 1.0, 1.0);
  } else {
    vColor = vec4(1.0, 1.0, 0.5, 1.0);
  }

  gl_Position = uProjectionMatrix * uViewMatrix * position;
}
`;
