define(["pex/core/Core", "pex/util/ObjUtils", "text!materials/GlossyMaterial.glsl"], function(Core, ObjUtils, GlossyMaterialGLSL) {

  function GlossyMaterial(uniforms) {
    Core.Material.call(this);
    this.gl = Core.Context.currentContext.gl;
    this.program = new Core.Program(GlossyMaterialGLSL);
    this.uniforms = ObjUtils.mergeObjects({eyePos: new Core.Vec3(0, 0, 0), refraction: 0.65 }, uniforms);
  }

  GlossyMaterial.prototype = new Core.Material();

  return GlossyMaterial;
});
