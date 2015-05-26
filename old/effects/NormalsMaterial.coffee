define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  NormalsMaterialGLSL = require('lib/text!effects/NormalsMaterial.glsl')

  class NormalsMaterial extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(NormalsMaterialGLSL)

      defaults = {
        pointSize : 2
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
