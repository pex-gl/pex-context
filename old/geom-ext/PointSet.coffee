define (require) ->
  { Mesh } = require 'pex/gl'
  { Sphere } = require 'pex/geom/gen'
  { SolidColor } = require 'pex/materials'

  class PointSet extends Mesh
    constructor: ({@n, @material, @r, @exp}) ->
      @n ?= 1
      @r ?= 0.1
      @material ?= new SolidColor()
      @geom = new Sphere(@r, 6, 6)
      @exp ?= (i) -> new Vec3(0,0,0)
      super(@geom, @material)

    draw: (camera) ->
      for i in [0..@n-1]
        p = @exp(i, i / (@n-1), @position)
        @position = p
        super(camera)