#ifdef VERT

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 ecNormal;
varying vec3 ecPos;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  ecPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
  ecNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
}

#endif

#ifdef FRAG

#ifdef LOD_ENABLED
#ifdef WEBGL
  #extension GL_EXT_shader_texture_lod : require
#else
  #extension GL_ARB_shader_texture_lod : require
#endif
#endif

uniform mat4 invViewMatrix;

uniform samplerCube texture;
uniform float lod;
varying vec3 ecNormal;
varying vec3 ecPos;

void main() {
  vec3 eyeDir = normalize(ecPos); //Direction to eye = camPos (0,0,0) - ecPos
  vec3 ecN = normalize(ecNormal);
  vec3 ecReflected = reflect(eyeDir, ecN); //eye coordinates reflection vector
  vec3 wcReflected = vec3(invViewMatrix * vec4(ecReflected, 0.0)); //world coordinates reflection vector

  #ifdef LOD_ENABLED
  gl_FragColor = textureCubeLod(texture, wcReflected, lod);
  #else
  gl_FragColor = textureCube(texture, wcReflected);
  #endif
}

#endif
