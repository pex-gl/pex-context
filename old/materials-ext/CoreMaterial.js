//wireframe rendering based on http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
define(["pex/core/Core", "pex/util/ObjUtils", "plask", "text!materials/CoreMaterial.glsl"], function(Core, ObjUtils, plask, CoreMaterialGLSL) {
    function CoreMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(CoreMaterialGLSL);

      var defaults = {
        ambientColor : new Core.Vec4(0.2, 0.2, 0.2, 1),
        diffuseColor : new Core.Vec4(1, 1, 1, 1),
        lightPos : new Core.Vec3(0, 0, 1),
        wrap : 0
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  CoreMaterial.prototype = new Core.Material();

  return CoreMaterial;
});