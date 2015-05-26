define (require) ->
  { MathUtils, Time } = require('pex/utils')

  class ExtrudeSegment
    constructor: (@distance=0.2, @startRadius, @radius=0.2, @duration=0.25) ->
      @faces = []
      @progress = 0

    apply: (hem, face) ->
      hem
        .clearFaceSelection()
        .selectFace(face)
        .extrude(0.0001)
      @faces.push(face)
      @normal = face.getNormal()
      @vertices = face.getAllVertices()

    update: () ->
      d = Time.delta * @distance / @duration
      @progress += Time.delta / @duration
      if @progress > 1 then @done = true
      @normal.normalize().scale(d)
      face = @faces[0]
      center = face.getCenter()
      r = @startRadius + (@radius - @startRadius) * @progress
      #console.log(r)
      for v in @vertices
        v.position.add(@normal)
        diff = v.position.dup().sub(center).normalize().scale(r)
        v.position.setVec3(center).add(diff)
