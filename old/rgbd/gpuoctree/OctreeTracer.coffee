define (require) ->
  { Mesh } = require('pex/gl')
  { Cube } = require('pex/geom/gen')
  { SolidColor } = require('pex/materials')
  { Color } = require('pex/color')
  { Mat4 } = require('pex/geom')
  OctreeTracerMaterial = require('OctreeTracerMaterial')

  class OctreeTracer extends Mesh
    constructor: (@octree, @octreeTexture) ->
      super(new Cube(), new OctreeTracerMaterial())
      @position.copy(@octree.root.size).scale(0.5).add(@octree.root.position)
      @scale.copy(@octree.root.size)

    draw: (camera) ->
      m = Mat4.create().copy(camera.getViewMatrix()).invert()
      @material.uniforms.invViewMatrix = m
      @material.uniforms.camPos = camera.getPosition();
      @material.uniforms.near = camera.getNear();
      @material.uniforms.far = camera.getFar();
      @material.uniforms.center = @position
      @material.uniforms.size = @scale
      #@material.uniforms.octree = @octreeTexture
      super(camera)