define (require) ->
  Time = require('pex/utils/Time')
  { floor } = Math

  class Split2
    constructor: (@distance=0.1, @duration=0.24) ->
      @faces = []
      @progress = 0

    apply: (hem, face) ->
      edges = []
      face.edgePairLoop (edge) -> edges.push(edge)

      @edge1 = edges[0]
      @edge2 = edges[floor(edges.length/2)]

      hem.splitEdge(@edge1, 0.5)
      hem.splitEdge(@edge2, 0.5)
      hem.splitFace(@edge1.next, @edge2.next)

      @normal = @edge1.face.getNormal()
      @faces.push(@edge1.face)
      @faces.push(@edge2.face)

    update: () ->
      d = Time.delta * @distance / @duration
      @normal.normalize().scale(d)
      @progress += Time.delta / @duration
      if @progress > 1 then @done = true
      @edge1.next.vert.position.add(@normal)
      @edge2.next.vert.position.add(@normal)