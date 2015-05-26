define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  NoiseDistortMaterialGLSL = require('lib/text!effects/NoiseDistortMaterial.glsl')

  class NoiseDistorMaterial extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(NoiseDistortMaterialGLSL)

      defaults = {
        pointSize : 2
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
