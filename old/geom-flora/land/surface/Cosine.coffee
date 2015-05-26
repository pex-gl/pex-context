define (require) ->
  { pow, sin, cos, PI } = Math
  BellCurve = require('flora/land/surface/BellCurve')

  class Cosine
    constructor: (@scale=2, @height=0.25) ->
      @bellCurve = new BellCurve(4, 1)

    eval: (u, v, t=0) ->
      period = 2
      f = @height * cos(@scale * u * 2 * PI + t)
      f *= @bellCurve.eval(u, v)
      return f