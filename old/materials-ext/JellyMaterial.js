define(['pex/materials/Material', 'pex/gl/Context', 'pex/utils/ObjectUtils', 'pex/gl/Program', 'lib/text!materials/JellyMaterial.glsl', 'pex/geom/Vec4'],
  function(Material, Context, ObjectUtils, Program, JellyMaterialGLSL, Vec4) {
  function JellyMaterial(uniforms) {
    Material.call(this);
    this.gl = Context.currentContext.gl;
    this.program = new Program(JellyMaterialGLSL);

    var defaults = {
     color : Vec4.fromValues(1, 1, 1, 1)
    };

    this.uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
  }

  JellyMaterial.prototype = Object.create(Material.prototype);

  return JellyMaterial;
});