define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec3',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!materials/FlatToonShading.glsl'
  ], function(Material, Context, Program, Vec3, Color, ObjectUtils, FlatToonShadingGLSL) {

  function FlatToonShading(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(FlatToonShadingGLSL);

    var defaults = {
      wrap: 1,
      pointSize : 1,
      lightPos : Vec3.create(10, 20, 30),
      ambientColor : Color.create(0, 0, 0, 1),
      diffuseColor : Color.create(1, 1, 1, 1)
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  FlatToonShading.prototype = Object.create(Material.prototype);

  return FlatToonShading;
});