define (require) ->
  FaceSelector = require('flora/plants/modular/FaceSelector')

  class AllFacesSelector extends FaceSelector
      constructor: () ->
        @faces = []

      apply: (hem, face) ->
        for face in hem.faces
          @faces.push(face)
        @done = true