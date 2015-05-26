//wireframe rendering based on http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/
define(["pex/core/Core", "pex/util/ObjUtils", "plask", "text!materials/SphereMaterial.glsl"], function(Core, ObjUtils, plask, SphereMaterialGLSL) {
    function SphereMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(SphereMaterialGLSL);

      var defaults = {
        ambientColor : new Core.Vec4(0.2, 0.2, 0.2, 1),
        diffuseColor : new Core.Vec4(1, 0, 1, 1),
        lightPos : new Core.Vec3(1, 0, 5),
        wrap : 1
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  SphereMaterial.prototype = new Core.Material();

  return SphereMaterial;
});