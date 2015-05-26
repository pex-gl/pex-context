define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/geom/Vec3',
  'pex/color/Color',
  'pex/utils/ObjectUtils',
  'lib/text!materials/SolidColorDist.glsl'
  ], function(Material, Context, Program, Vec3, Color, ObjectUtils, SolidColorDistGLSL) {

  function SolidColorDist(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(SolidColorDistGLSL);

    var defaults = {
     color : Color.create(1, 1, 1, 1),
     pointSize : 1,
     center: new Vec3(0, 0, 0),
     radius: 0.25
    };

    var uniforms = ObjectUtils.mergeObjects(defaults, uniforms);

    Material.call(this, program, uniforms);
  }

  SolidColorDist.prototype = Object.create(Material.prototype);

  return SolidColorDist;
});