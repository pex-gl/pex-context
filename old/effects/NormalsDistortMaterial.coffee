define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  NormalsDistortMaterialGLSL = require('lib/text!effects/NormalsDistortMaterial.glsl')

  class NormalsDistorMaterial extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(NormalsDistortMaterialGLSL)

      defaults = {
        pointSize : 3
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
