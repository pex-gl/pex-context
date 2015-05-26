define([
  'pex/materials/Material',
  'pex/gl/Context',
  'pex/gl/Program',
  'pex/utils/ObjectUtils',
  'pex/geom/Vec3',
  'pex/color/Color',
  'lib/text!materials/Reflection.glsl'
], function (Material, Context, Program, ObjectUtils, Vec3, Color, ReflectionGLSL) {
  function Reflection(uniforms) {
    this.gl = Context.currentContext.gl;
    var program = new Program(ReflectionGLSL);
    var defaults = { reflection: 0.5 };
    uniforms = ObjectUtils.mergeObjects(defaults, uniforms);
    Material.call(this, program, uniforms);
  }
  Reflection.prototype = Object.create(Material.prototype);
  return Reflection;
});
