define(['pex/gl/Context', 'pex/utils/ObjectUtils', 'pex/materials/Material', 'pex/gl/Program', 
  'lib/text!materials/PlanktonMaterial.glsl', 'pex/geom/Vec4'],
  function(Context, ObjectUtils, Material, Program, PlanktonMaterialGLSL, Vec4) {
  function PlanktonMaterial(uniforms) {
    Material.call(this);
    this.gl = Context.currentContext.gl;
    this.program = new Program(PlanktonMaterialGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1),
     pointSize : 5
    }

    this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }

  PlanktonMaterial.prototype = Object.create(Material.prototype);

  return PlanktonMaterial;
});