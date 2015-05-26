define(["pex/core/Core", "pex/util/ObjUtils"], function(Core, ObjUtils) {

  var vert = ""
    + "uniform mat4 projectionMatrix;"
    + "uniform mat4 modelViewMatrix;"
    + "attribute vec3 position;"
    + "attribute vec3 normal;"
    + "varying vec3 vTexCoord;"
    + "void main() {"
    +  "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);"
    +  "vTexCoord = normal * vec3(-1, 1, 1);"
    + "}";

  var frag = ""
    + "uniform samplerCube texture;"
    + "varying vec3 vTexCoord;"
    + "void main() {"
    +  "vec4 color = textureCube(texture, normalize(vTexCoord));"
    +  "color.rgb = (color.rgb * 256.0 * pow(2.0, color.a * 256.0 - 128.0)) / 256.0;"
    +  "gl_FragColor.rgba = vec4(color.rgb, 1.0);"
    + "}";

  function SkyBoxMaterial(uniforms) {
    Core.Material.call(this);
    this.gl = Core.Context.currentContext.gl;
    this.program = new Core.Program(vert, frag);
    this.uniforms = ObjUtils.mergeObjects({}, uniforms);
  }

  SkyBoxMaterial.prototype = new Core.Material();

  return SkyBoxMaterial;
});
