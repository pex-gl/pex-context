define (require) ->
  { Vec3, Edge, Geometry } = require 'pex/geom'
  { Mesh } = require 'pex/gl'
  { LineBuilder } = require 'pex/geom/gen'
  { SolidColor } = require 'pex/materials'

  class PointLine extends Mesh
    constructor: ({@n, @material, @r, @exp}) ->
      @n ?= 1
      @r ?= 0.1
      @geom = new Geometry({vertices:true, edges:true, faces:false})
      @material ?= new SolidColor()
      super(@geom, @material, { useEdges: true })

    draw: (camera) ->
      vertices = @geom.vertices
      needsEdges = @geom.edges.length == 0
      for i in [0..@n-1]
        vertices[i] = @exp(i, i / (@n-1), vertices[i])

      if needsEdges
        for i in [0..vertices.length-2]
          @geom.edges.push(new Edge(i, i+1))

      @geom.vertices.dirty = true

      super(camera)