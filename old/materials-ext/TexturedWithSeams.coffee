define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  TexturedWithSeamsGLSL = require('lib/text!materials/TexturedWithSeams.glsl')

  class TexturedWithSeams extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(TexturedWithSeamsGLSL)

      defaults =

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
