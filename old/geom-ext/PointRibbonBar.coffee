define (require) ->
  { Vec3, Face3, Geometry } = require 'pex/geom'
  { Mesh } = require 'pex/gl'
  { SolidColor } = require 'pex/materials'

  class PointRibbonBar extends Mesh
    constructor: ({@n, @material, @subdiv, @width, @exp, @baseY}) ->
      @n ?= 1
      @subdiv ?= 1
      @width ?= 1
      @points = []
      @height ?= 0.2
      @material ?= new SolidColor()
      @geom = new Geometry({vertices: true, normals: true, faces:true})
      super(@geom, @material)

    draw: (camera) ->
      vertices = @geom.vertices
      vertices.dirty = true
      normals = @geom.normals
      normals.dirty = true
      faces = @geom.faces
      needsFaces = (faces.length == 0)
      step = 1 / (@n-1)
      subStep = if @subdiv > 1 then  1 / (@subdiv - 1) else 0
      idx = 0
      for i in [0..@n-1]
        j = 0

        if i < @n - 1
          for j in [0..@subdiv-1]
            vertices[idx] = @exp(i*@subdiv+j, i * step + j * subStep * step, vertices[idx])
            vertices[idx+1] = @exp(i*@subdiv+j, i * step + j * subStep * step, vertices[idx+1])
            vertices[idx+2] = @exp(i*@subdiv+j, i * step + j * subStep * step, vertices[idx+2])
            vertices[idx+3] = @exp(i*@subdiv+j, i * step + j * subStep * step, vertices[idx+3])
            vertices[idx+1].z -= @width
            vertices[idx+2].y -= @height
            vertices[idx+3].y -= @height
            vertices[idx+3].z -= @width
            idx +=4
        else
          vertices[idx] = @exp(i*@subdiv, i * step, vertices[idx])
          vertices[idx+1] = @exp(i*@subdiv, i * step, vertices[idx+1])
          vertices[idx+2] = @exp(i*@subdiv, i * step, vertices[idx+2])
          vertices[idx+3] = @exp(i*@subdiv, i * step, vertices[idx+3])
          vertices[idx+1].z -= @width
          vertices[idx+2].y -= @height
          vertices[idx+3].y -= @height
          vertices[idx+3].z -= @width
          idx +=4

      if needsFaces
        for i in [0..vertices.length-1]
          normals[i] = new Vec3()

      @ab ?= new Vec3()
      @ac ?= new Vec3()
      for i in [0..vertices.length-7] by 4
        @ab.asSub(vertices[i], vertices[i+1])
        @ac.asSub(vertices[i], vertices[i+2])
        if (@ac.length() < 0.01) && vertices[i+4]
          @ac.asSub(vertices[i], vertices[i+4])
        normals[i].asCross(@ac, @ab)

      if needsFaces
        for i in [0..vertices.length-7] by 4
          faces.push(new Face3(i, i + 4 + 1, i + 1))
          faces.push(new Face3(i, i + 4, i + 4 + 1))
          faces.push(new Face3(i+2, i+2 + 4 + 1, i+2 + 1))
          faces.push(new Face3(i+2, i+2 + 4, i+2 + 4 + 1))
          faces.push(new Face3(i, i + 4, i + 6))
          faces.push(new Face3(i, i + 6, i + 2))
          faces.push(new Face3(i+1, i+1 + 4, i+1 + 6))
          faces.push(new Face3(i+1, i+1 + 6, i+1 + 2))
      #for i in [0..@n*@subdiv-2]
      #  @lineBuilder.addLine(@points[i], @points[i+1])

      #@lineBuilder.vertices.dirty = true
      #

      super(camera)