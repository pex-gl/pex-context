define (require) ->
  { Vec3, Edge, Geometry } = require 'pex/geom'
  { Mesh } = require 'pex/gl'
  { LineBuilder } = require 'pex/geom/gen'
  { SolidColor } = require 'pex/materials'

  class PointCurve extends Mesh
    constructor: ({@n, @material, @subdiv, @exp}) ->
      @n ?= 1
      @subdiv ?= 1
      @geom = new Geometry({vertices:true, edges:true, faces:false})
      @material ?= new SolidColor()
      super(@geom, @material, { useEdges: true })

    draw: (camera) ->
      vertices = @geom.vertices
      needsEdges = @geom.edges.length == 0
      step = 1 / (@n-1)
      subStep = if @subdiv > 1 then  1 / (@subdiv - 1) else 0
      idx = 0
      for i in [0..@n-1]
        j = 0
        if i < @n - 1
          for j in [0..@subdiv-1]
            vertices[idx] = @exp(i*@subdiv+j, i * step + j * subStep * step, vertices[idx])
            idx++
        else
          vertices[idx] = @exp(i*@subdiv, i * step, vertices[idx])
          idx++

      if needsEdges
        for i in [0..vertices.length-2]
          @geom.edges.push(new Edge(i, i+1))

      @geom.vertices.dirty = true

      super(camera)