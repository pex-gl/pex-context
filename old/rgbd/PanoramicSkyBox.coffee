define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  PanoramicSkyBoxGLSL = require('lib/text!materials/PanoramicSkyBox.glsl')

  class PanoramicSkyBox extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(PanoramicSkyBoxGLSL)

      defaults =
        eyePos: new Vec3(0, 0, 0)
        skyBox: 0
        refraction: 0
        reflection: 0
        glass: 0

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
