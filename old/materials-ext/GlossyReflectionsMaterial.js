define(["pex/core/Core", "pex/util/ObjUtils", "text!materials/GlossyReflectionsMaterial.glsl"], function(Core, ObjUtils, GlossyReflectionsGLSL) {

  function GlossyReflectionsMaterial(uniforms) {
    Core.Material.call(this);
    this.gl = Core.Context.currentContext.gl;
    this.program = new Core.Program(GlossyReflectionsGLSL);
    this.uniforms = ObjUtils.mergeObjects({eyePos: new Core.Vec3(0, 0, 0), refraction: 0.65 }, uniforms);
  }

  GlossyReflectionsMaterial.prototype = new Core.Material();

  return GlossyReflectionsMaterial;
});
