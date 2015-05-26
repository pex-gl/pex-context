define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  ShadowMappedGLSL = require('lib/text!materials/ShadowMapped.glsl')

  class ShadowMapped extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(ShadowMappedGLSL)

      defaults =
        ambientColor: Color.create(0, 0, 0, 1)
        diffuseColor: Color.create(1, 1, 1, 1)
        specularColor: Color.create(1, 1, 1, 1)

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
