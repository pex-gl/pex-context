define (require) ->
  { Context } = require('pex/gl')
  { Geometry, Vec2 } = require('pex/geom')
  { Mesh, TextureCube } = require('pex/gl')
  { MathUtils } = require('pex/utils')
  NormalsDistortMaterial = require('effects/NormalsDistortMaterial')

  class NormalsDistort
    amount: 1
    amountMouse: 0
    constructor:  (@app, @source, @boundingBox, @rgbdTexture) ->
      gl = @gl = Context.currentContext.gl

      geom = new Geometry({vertices:true, texCoords:true, faces:false})

      w = @source.textureSize.x
      h = @source.textureSize.y
      for i in [0..w*h/2-1] by 1
        s = (i % w) / w + Math.random() * 0.1
        t = Math.floor((i / w)) / (h/2) + Math.random() * 0.1
        #if t < 0.13-0.05 then continue
        #if t > 0.33+0.05 then continue
        #t *= 2
        geom.vertices.push(MathUtils.randomVec3().scale(3000))
        geom.texCoords.push(new Vec2(s, t))

      material = new NormalsDistortMaterial({
        pointSize: 3
        rgbd: @rgbdTexture
        bboxMin: @source.boundingBox.min
        bboxMax: @source.boundingBox.max
        bboxCenter: @source.boundingBox.getCenter()
        amount: @amount
        amountMouse: @amountMouse
      })

      @mesh = new Mesh(geom, material, { primitiveType: gl.POINTS})

    draw: (camera) ->
      @gl.enable(@gl.DEPTH_TEST)
      @gl.enable(@gl.BLEND)
      @gl.blendFunc(@gl.SRC_ALPHA, @gl.ONE)
      @mesh.material.uniforms.amount = @amount
      @mesh.material.uniforms.amountMouse = @amountMouse
      @mesh.draw(camera)