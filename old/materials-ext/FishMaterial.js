define(['pex/materials/Material', 'pex/gl/Context', 'pex/utils/ObjectUtils', 'pex/gl/Program', 'lib/text!materials/FishMaterial.glsl', 'pex/geom/Vec4'],
  function(Material, Context, ObjectUtils, Program, FishMaterialGLSL, Vec4) {
  function FishMaterial(uniforms) {
    Material.call(this);
    this.gl = Context.currentContext.gl;
    this.program = new Program(FishMaterialGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1)
    };

    this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }

  FishMaterial.prototype = Object.create(Material.prototype);

  return FishMaterial;
});