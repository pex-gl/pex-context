define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Mat4 = require('pex/geom/Mat4')
  Color = require('pex/color/Color')
  OctreeTracerMaterialGLSL = require('lib/text!./OctreeTracerMaterial.glsl')

  class OctreeTracerMaterial extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(OctreeTracerMaterialGLSL)

      defaults =
        invViewMatrix: new Mat4()

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
