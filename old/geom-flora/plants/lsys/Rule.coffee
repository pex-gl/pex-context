define (require) ->
  class Rule
    constructor: (@input, @output, @probabilty=1) ->
