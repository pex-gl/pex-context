define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "varying vec3 vNormal;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "vNormal = normal * vec3(-1, 1, 1);"
    + "}";

  var frag = ""
    + "uniform sampler2D texture;"
    + "varying vec3 vNormal;"
    + "uniform float brightness;"
    + "void main() {"
    +  "gl_FragColor = brightness * pow(texture2D(texture, vec2((1.0 + atan(vNormal.z, vNormal.x)/3.14159265359)/2.0, acos(-vNormal.y)/3.14159265359)), vec4(1.0/2.2));"
    + "}";

  function SkyBoxMaterial2D(uniforms) {
    var defaults = {
      brightness: 1
    }
    Core.Material.call(this);
    this.gl = Core.Context.currentContext.gl;
    this.program = new Core.Program(vert, frag);
    this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  SkyBoxMaterial2D.prototype = new Core.Material();

  return SkyBoxMaterial2D;
});
