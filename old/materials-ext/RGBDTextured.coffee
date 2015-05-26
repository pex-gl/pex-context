define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  RGBDTExturedGLSL = require('lib/text!materials/RGBDTextured.glsl')
  RGBDUtilsGLSL = require('lib/text!materials/RGBDUtils.inc.glsl')

  class RGBDTExtured extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(RGBDUtilsGLSL + '\n' + RGBDTExturedGLSL)

      defaults = {
        maxDepth: 5999,
        opacity: 1
        pointSize: 2
        highlight: 0
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
