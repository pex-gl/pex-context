define (require) ->
  Vec3 = require('pex/geom/Vec3')

  class AnimatedVec3
    constructor: (v) ->
      @initialValue = v.dup()
      @value = v.dup()
      @target = v.dup()

    update: () ->
      @value.x += (@target.x - @value.x) * 0.1
      @value.y += (@target.y - @value.y) * 0.1
      @value.z += (@target.z - @value.z) * 0.1
