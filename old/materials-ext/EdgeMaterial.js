//wireframe rendering based on http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
define(["pex/core/Core", "pex/util/ObjUtils", "plask", "text!materials/EdgeMaterial.glsl"], function(Core, ObjUtils, plask, EdgeMaterialGLSL) {
    function EdgeMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(EdgeMaterialGLSL);

      var defaults = {
        color : new Core.Vec4(1, 1, 1, 1),
        alphaBoost : 0
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  EdgeMaterial.prototype = new Core.Material();

  return EdgeMaterial;
});