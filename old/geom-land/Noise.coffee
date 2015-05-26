define (require) ->
  { pow, sin, cos, PI } = Math
  PerlinNoise = require('lib/PerlinNoise')

  class Noise
    constructor: (@scale=5, @height=0.25) ->

    eval: (u, v, t=0) ->
      @height * PerlinNoise.noise((u+0.5) * @scale, (v+0.5 + t / 10) * @scale, 0)