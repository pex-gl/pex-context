define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  PanoramicEvnMapGLSL = require('lib/text!materials/PanoramicEnvMap.glsl')

  class PanoramicEvnMap extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(PanoramicEvnMapGLSL)

      defaults =
        eyePos: new Vec3(0, 0, 0)
        skyBox: 1
        refraction: 0
        reflection: 0
        glass: 0

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
