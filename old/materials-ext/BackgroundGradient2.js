define(["pex/core/Core", "pex/util/ObjUtils", "text!InScatter.glsl"], function(Core, ObjUtils, InScatterGLSL) {
  function BackgroundGradient(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(InScatterGLSL);

      var defaults = {
        topColor : new Core.Vec4(1, 1, 0, 1),
        bottomColor : new Core.Vec4(1, 0, 0, 1)
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  BackgroundGradient.prototype = new Core.Material();

  return BackgroundGradient;
});