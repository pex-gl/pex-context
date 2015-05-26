define (require) ->
  { Vec3, Quat } = require('pex/geom')
  { randomVec3 } = require('pex/utils/MathUtils')

  UP = new Vec3(0, 1, 0)

  class Instance
    constructor: (spread=0.00001, scale=0.0) ->
      @targetPosition = randomVec3(spread)
      @targetRotation = new Quat().setAxisAngle(UP, 0)
      @targetScale = new Vec3(scale, scale, scale)
      @position = new Vec3(0, 0, 0)
      @rotation = new Quat().setAxisAngle(UP, 0)
      @scale = new Vec3(0, 0, 0)

    update: () ->
      @position.x += (@targetPosition.x - @position.x) * 0.1
      @position.y += (@targetPosition.y - @position.y) * 0.1
      @position.z += (@targetPosition.z - @position.z) * 0.1
      @scale.x += (@targetScale.x - @scale.x) * 0.1
      @scale.y += (@targetScale.y - @scale.y) * 0.1
      @scale.z += (@targetScale.z - @scale.z) * 0.1
      @rotation.slerp(@targetRotation, 0.1, false)