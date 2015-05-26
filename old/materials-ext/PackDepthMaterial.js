define(["pex/core/Core", "pex/util/ObjUtils", "text!materials/PackDepth.glsl"], function(Core, ObjUtils, PackDepthGLSL) {
  function PackDepthMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(PackDepthGLSL);

      var defaults = {
        near: 0.1,
        far: 100
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  PackDepthMaterial.prototype = new Core.Material();

  return PackDepthMaterial;
});