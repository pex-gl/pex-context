define (require) ->
  FaceSelector = require('flora/plants/modular/FaceSelector')

  class RandomFaceSelector extends FaceSelector
    constructor: () ->
      @faces = []

    apply: (hem, face) ->
      @faces.push(randomElement(hem.faces))
      @done = true