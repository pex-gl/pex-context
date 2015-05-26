define(["pex/core/Core"], function(Core) {

  var vert = " \
  uniform mat4 projectionMatrix; \
  uniform mat4 modelViewMatrix; \
  uniform mat4 normalMatrix; \
  attribute vec3 position; \
  attribute vec3 normal; \
  attribute vec2 texCoord; \
  varying vec3 vNormal; \
  varying vec2 vTexCoord; \
  void main() { \
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); \
    gl_PointSize = 2.0; \
    vNormal = (normalMatrix * vec4(normal, 1.0)).xyz; \
    vTexCoord = texCoord; \
  }";

  var frag = " \
  vec4 checker(vec2 uv) { \
     float checkSize = 8.0; \
     float fmodResult = mod(floor(checkSize * uv.x) + floor(checkSize * uv.y),2.0); \
     if (fmodResult < 1.0) { \
       return vec4(1, 1, 1, 1); \
     } else { \
       return vec4(0, 0, 0, 1); \
     } \
  } \
  varying vec3 vNormal; \
  varying vec2 vTexCoord; \
  void main() { \
    vec3 N = normalize(vNormal); \
    vec3 L = normalize(vec3(10.0, 10.0, 10.0)); \
    float nDotL = dot(N, L); \
    if (nDotL < 0.0) nDotL = 0.0; \
    else if (nDotL < 0.2) nDotL = 0.2; \
    else if (nDotL < 0.5) nDotL = 0.5; \
    else if (nDotL < 0.75) nDotL = 0.75; \
    else if (nDotL < 0.95) nDotL = 0.95; \
    else nDotL = 0.99; \
    float val = sin(vTexCoord.y*2000.0); \
    val = step(val, 0.5); \
    float val2 = sin(vTexCoord.y*1000.0); \
    val2 = step(val2, 0.5); \
    if (nDotL > 1111110.25) val = val2; \
    if (nDotL > 0.5) val = 1.0; \
    gl_FragColor.rgb = vec3(val); \
    gl_FragColor.a = 1.0; \
  }";

  function StripesMaterial() {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(vert, frag);
  }

  StripesMaterial.prototype = new Core.Material();

  return StripesMaterial;
});
