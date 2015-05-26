define (require) ->

  Material = require('pex/materials/Material')
  Context = require('pex/gl/Context')
  Program = require('pex/gl/Program')
  ObjectUtils = require('pex/utils/ObjectUtils')
  Vec3 = require('pex/geom/Vec3')
  Color = require('pex/color/Color')
  GPUParticleRenderGLSL = require('lib/text!./GPUParticleRender.glsl')

  class GPUParticleRender extends Material
    constructor: (uniforms) ->
      @gl = Context.currentContext.gl
      program = new Program(GPUParticleRenderGLSL)

      defaults =
        pointSize : 1
        lightPos: Vec3.create(0, 0, 0)
        lightRadius: 1
        particleColor: new Color(0.0, 0.4, 0.8, 1.0)
        lightColor: new Color(0.6, 0.8, 0.99, 1.0)
        particlePositions: null

      uniforms = ObjectUtils.mergeObjects(defaults, uniforms)

      super(program, uniforms)
