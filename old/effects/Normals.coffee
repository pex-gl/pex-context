define (require) ->
  { Context } = require('pex/gl')
  { Geometry, Vec2 } = require('pex/geom')
  { Mesh, TextureCube } = require('pex/gl')
  { MathUtils } = require('pex/utils')
  NormalsMaterial = require('effects/NormalsMaterial')

  class Normals
    amount: 1
    constructor:  (@app, @source, @boundingBox, @rgbdTexture) ->
      gl = @gl = Context.currentContext.gl

      geom = new Geometry({vertices:true, texCoords:true, faces:false})

      w = @source.textureSize.x
      h = @source.textureSize.y
      for i in [0..w*h/2-1] by 1
        s = (i % w) / w + Math.random() * 0.1
        t = Math.floor((i / w)) / h + Math.random() * 0.1
        if t < 0.13-0.05 then continue
        if t > 0.33+0.05 then continue
        t *= 2
        geom.vertices.push(MathUtils.randomVec3().scale(3000))
        geom.texCoords.push(new Vec2(s, t))

      material = new NormalsMaterial({
        pointSize: 3
        rgbd: @rgbdTexture
        bboxMin: @source.boundingBox.min
        bboxMax: @source.boundingBox.max
        amount: @amount
      })

      @mesh = new Mesh(geom, material, { primitiveType: gl.POINTS})

    draw: (camera) ->
      @gl.enable(@gl.DEPTH_TEST)
      @mesh.material.uniforms.amount = @amount
      @mesh.draw(camera)