define (require) ->
  { Context, Texture2D } = require('pex/gl')
  { Geometry, Vec2, hem } = require('pex/geom')
  { Mesh, TextureCube } = require('pex/gl')
  { MathUtils } = require('pex/utils')
  { Cube } = require('pex/geom/gen')
  { ShowNormals, BlinnPhong } = require('pex/materials')
  PanoramicEnvMap = require('materials/PanoramicEnvMap')

  clamp = (a, min, max) ->
    if a < min then return min
    if a > max then return max
    a

  class Normals
    amount: 1
    constructor:  (@app, @source, @boundingBox, @rgbdTexture) ->
      gl = @gl = Context.currentContext.gl
      s = @boundingBox.getSize()
      center = @boundingBox.getCenter()

      @meshes = []

      #c1 = new Cube(s.z/10*(Math.random()*0.5+0.5), s.z/10*(Math.random()*0.25+0.75), s.z/6)
      #geom1 = hem().fromGeometry(c1).triangulate().subdivideTriangles().selectRandomVertices(0.5).pull(s.z/20).toFlatGeometry()

      c2 = new Cube(s.z/10*(Math.random()*0.95+0.05), s.z/10*(Math.random()*0.25+0.75), s.z/6)
      geom1 = hem().fromGeometry(c2).triangulate().subdivideTriangles().selectRandomVertices(0.35).pull(s.z/40).toFlatGeometry()

      #geom1 = new Cube(s.y/10)

      #material = new BlinnPhong()
      @material = material = new PanoramicEnvMap({skyBox:0, texture:@rgbdTexture})

      for i in [0..100]
        geom = new Cube(s.z/5*(Math.random()*0.9+0.1), s.z/10*(Math.random()*0.9+0.1), s.z/10*(Math.random()*0.9+0.1))
        geom = hem().fromGeometry(geom).triangulate().subdivideTriangles().selectRandomVertices(0.35).pull(s.z/40).toFlatGeometry()
        m = new Mesh(geom, material)
        m.position = center.clone().add(MathUtils.randomVec3().normalize().scale(MathUtils.randomFloat(s.y*0.4, s.y*0.8)))
        m.offset = Math.random()*0.9
        @meshes.push(m)

    draw: (camera) ->
      @gl.enable(@gl.DEPTH_TEST)
      #@mesh.material.uniforms.amount = @amount
      #@mesh.draw(camera)
      for mesh in @meshes
        scale = clamp(MathUtils.map(@amount, mesh.offset, mesh.offset+0.1, 0, 1), 0, 1)
        mesh.scale.set(scale, scale, scale)
        mesh.material.uniforms.eyePos = camera.getPosition()

      mesh.draw(camera) for mesh in @meshes