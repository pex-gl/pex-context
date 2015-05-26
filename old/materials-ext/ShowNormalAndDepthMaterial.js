define(["pex/core/Core"], function(Core) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "uniform mat4 normalMatrix;"
    + "uniform mat4 modelWorldMatrix;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "attribute vec2 texCoord;"
    + "varying vec3 vNormal;"
    + "varying vec3 vPosition;"    
    + "varying vec3 wPosition;"
    + "varying vec2 vTexCoord;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "gl_PointSize = 2.0;"
    +  "vNormal = (normalMatrix * vec4(normal, 1.0)).xyz;"
    +  "vTexCoord = texCoord;"
    +  "wPosition = (modelWorldMatrix * vec4(position, 1.0)).xyz;"
    +  "vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;"
    + "}";

  var frag = ""
    + "varying vec3 vNormal;"
    + "varying vec2 vTexCoord;"
    + "varying vec3 vPosition;"
    + "varying vec3 wPosition;"
    + "void main() {"
    + "  gl_FragColor = vec4(normalize(vNormal.xyz), vPosition.z);"
    + "}";

  function ShowNormalAndDepthMaterial() {
      this.gl = Core.Context.currentContext;
      this.program = new Core.Program(vert, frag);
  }

  ShowNormalAndDepthMaterial.prototype = new Core.Material();

  return ShowNormalAndDepthMaterial;
});
