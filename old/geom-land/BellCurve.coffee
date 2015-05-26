define (require) ->
  { pow, sin } = Math

  class BellCurve
    constructor: (@scale=6, @height=0.25) ->
    eval: (u, v, t=0) ->
      #return 0.5 - (u * u + v * v)
      a = @height + 0.25 * sin(t)
      e = 2.71828
      b = 0
      c = 1
      d = 0
      x = u * @scale
      z = v * @scale
      fx = a * pow(e, -(x - b)*(x - b) / ( 2 * c * c)) + d
      fz = a * pow(e, -(z - b)*(z - b) / ( 2 * c * c)) + d
      return fx * fz