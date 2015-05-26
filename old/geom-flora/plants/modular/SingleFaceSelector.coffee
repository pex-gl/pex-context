define (require) ->
  FaceSelector = require('flora/plants/modular/FaceSelector')
  Time = require('pex/utils/Time')

  class SingleFaceSelector extends FaceSelector
    constructor: (@up) ->
      @faces = []

    apply: (hem, face) ->
      for face in hem.faces
        n = face.getNormal()
        if n.dot(@up) >= 0.9999
          @faces.push(face)
          @done = true
          break