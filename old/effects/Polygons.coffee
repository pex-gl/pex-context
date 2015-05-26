define (require) ->
  { Context } = require('pex/gl')
  { Geometry, Vec2, Vec3, Vec4 } = require('pex/geom')
  { Mesh, TextureCube } = require('pex/gl')
  { MathUtils } = require('pex/utils')
  PolygonsMaterial = require('effects/PolygonsMaterial')

  class Polygons
    maxTriangleSize: 150,
    amount: 1
    cutout: 1
    constructor:  (@app, @source, @boundingBox, @rgbdTexture) ->
      gl = @gl = Context.currentContext.gl

      geom = new Geometry({vertices:true, normals:true, texCoords:true, faces:false})

      w = @source.textureSize.x
      h = @source.textureSize.y

      list = [0..w*h/2-1]
      for i in [0..w*h/2-1]
        a = i
        b = i + Math.floor(Math.random()*10)
        [list[a], list[b]] = [list[b], list[a]]

      for j in [0..w*h/2-1] by 2
        i = list[j]
        if (j % 6 == 0)
          i1 = list[j + 2]
          i2 = list[j + 4]
        else if (j % 6 == 2)
          i1 = list[j - 2]
          i2 = list[j + 2]
        else
          i1 = list[j - 2]
          i2 = list[j - 4]
        s = (i % w) / w
        t = Math.floor((i / w)) / h
        s1 = ((i1) % w) / w
        t1 = Math.floor(((i1) / w)) / h
        s2 = ((i2) % w) / w
        t2 = Math.floor(((i2) / w)) / h
        geom.vertices.push(MathUtils.randomVec3().scale(3000))
        geom.texCoords.push(new Vec2(s, t))
        geom.normals.push(new Vec4(s1, t1, s2, t2))

      #geom.vertices.splice(0, geom.vertices.length*0.85)
      #geom.texCoords.splice(0, geom.texCoords.length*0.85)
      #geom.normals.splice(0, geom.normals.length*85)

      material = new PolygonsMaterial({
        pointSize: 1
        rgbd: @rgbdTexture
        bboxMin: @source.boundingBox.min
        bboxMax: @source.boundingBox.max
      })

      @mesh = new Mesh(geom, material, { primitiveType: gl.TRIANGLES})

    draw: (camera) ->
      @gl.enable(@gl.POLYGON_OFFSET_FILL)
      @gl.polygonOffset(0.75, -50)
      @mesh.material.uniforms.maxTriangleSize = @maxTriangleSize * @amount
      @mesh.material.uniforms.cutout = @cutout
      @gl.enable(@gl.DEPTH_TEST)
      @mesh.draw(camera)
      @gl.disable(@gl.POLYGON_OFFSET_FILL)