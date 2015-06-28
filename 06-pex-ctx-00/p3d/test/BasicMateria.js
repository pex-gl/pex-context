var VERT = ' \
attribute vec2 aTexCoord0; \
attribute vec3 aNormal; \
attribute vec4 aPosition; \
uniform mat4 projection; \
uniform mat4 view; \
uniform mat4 model; \
varying vec3 vNormal; \
varying vec2 vUv; \
void main() { \
  vUv = aTexCoord0; \
  vNormal = aNormal; \
  gl_Position = projection * view * model * aPosition; \
  gl_PointSize = 1.0; \
}';

var FRAG = ' \
varying vec2 vUv; \
varying vec3 vNormal; \
uniform sampler2D iChannel0; \
uniform vec2 repeat; \
uniform vec2 uvOffset; \
void main() { \
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0); \
  gl_FragColor = vec4(vUv, 0.0, 1.0); \
  gl_FragColor = texture2D(iChannel0, vUv * repeat + uvOffset); \
}';

module.exports = {
    vert: VERT,
    frag: FRAG
}
