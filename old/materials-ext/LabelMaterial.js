define(["pex/core/Core", "pex/util/ObjUtils", "text!materials/LabelMaterial.glsl"], function(Core, ObjUtils, LabelMaterialGLSL) {
  function LabelMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(LabelMaterialGLSL);

      var defaults = {
        alpha: 1
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  LabelMaterial.prototype = new Core.Material();

  return LabelMaterial;
});