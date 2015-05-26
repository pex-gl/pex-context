define(["pex/core/Core", "pex/util/ObjUtils", "text!AreaLight.glsl"], function(Core, ObjUtils, AreaLightGLSL) {
  function AreaLightMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(AreaLightGLSL);

      var defaults = {
        ambientColor : new Core.Vec4(0.2, 0.2, 0.2, 1),
        diffuseColor : new Core.Vec4(1, 1, 1, 1),
        lightPos : new Core.Vec3(1, 1, 1),
        wrap : 0
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  AreaLightMaterial.prototype = new Core.Material();

  return AreaLightMaterial;
});