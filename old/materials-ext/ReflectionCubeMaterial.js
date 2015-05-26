define(["pex/core/Core", "pex/util/ObjUtils", "text!materials/ReflectionCube.glsl"], function(Core, ObjUtils, ReflectionCubeGLSL) {
  function ReflectionCubeMaterial(uniforms) {
      this.gl = Core.Context.currentContext.gl;
      this.program = new Core.Program(ReflectionCubeGLSL);

      var defaults = {
        eyePos : new Core.Vec3(0, 0, 1),
        refraction : 0,
        reflection : 0
      };

      this.uniforms = ObjUtils.mergeObjects(defaults, uniforms);
  }

  ReflectionCubeMaterial.prototype = new Core.Material();

  return ReflectionCubeMaterial;
});