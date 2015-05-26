define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  RenderInScreenSpaceGLSL = require('lib/text!materials/RenderInScreenSpace.glsl')

  class RenderInScreenSpace extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(RenderInScreenSpaceGLSL)

      defaults =
        ambientColor: Color.create(0, 0, 0, 1)
        diffuseColor: Color.create(1, 1, 1, 1)
        specularColor: Color.create(1, 1, 1, 1)
        lightPos: new Vec3(15, 5, 5)
        wrap: 1

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
