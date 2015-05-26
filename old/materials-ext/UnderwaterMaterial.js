//wireframe rendering based on http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
define(["pex/core/Core", "pex/util/ObjUtils", "plask", "text!UnderwaterMaterial.glsl"], function(Core, ObjUtils, plask, UnderwaterMaterialGLSL) {
    function UnderwaterMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(UnderwaterMaterialGLSL);

      var defaults = {
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  UnderwaterMaterial.prototype = new Core.Material();

  return UnderwaterMaterial;
});