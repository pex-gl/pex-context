define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  ShowDepthInScreenSpaceGLSL = require('lib/text!materials/ShowDepthInScreenSpace.glsl')

  class ShowDepthInScreenSpace extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(ShowDepthInScreenSpaceGLSL)

      defaults =
        near: 0
        far: 10
        nearColor: Color.create(0, 0, 0, 1)
        farColor: Color.create(1, 1, 1, 1)

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)