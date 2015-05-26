define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  ShowIsoLinesGLSL = require('lib/text!materials/ShowIsoLines.glsl')

  class ShowIsoLines extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(ShowIsoLinesGLSL)

      defaults = {
        distance: 0.05
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
