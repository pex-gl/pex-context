define(['pex/materials/Material', 'pex/gl/Context', 'pex/utils/ObjectUtils', 'pex/gl/Program', 'lib/text!materials/SquidMaterial.glsl', 'pex/geom/Vec4'],
  function(Material, Context, ObjectUtils, Program, SquidMaterialGLSL, Vec4) {
  function SquidMaterial(uniforms) {
    Material.call(this);
    this.gl = Context.currentContext.gl;
    this.program = new Program(SquidMaterialGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1)
    };

    this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }

  SquidMaterial.prototype = Object.create(Material.prototype);

  return SquidMaterial;
});