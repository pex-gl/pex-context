define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  PolygonsMaterialGLSL = require('lib/text!effects/PolygonsMaterial.glsl')

  class PolygonsMaterial extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(PolygonsMaterialGLSL)

      defaults = {
        pointSize : 2
        cutout: 1
      }

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
