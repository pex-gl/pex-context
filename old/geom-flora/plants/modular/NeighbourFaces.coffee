define (require) ->
  class NeighbourFaces
    constructor: () ->
      @faces = []

    apply: (hem, face) ->
      face.edgePairLoop (edge) =>
        @faces.push(edge.pair.face)