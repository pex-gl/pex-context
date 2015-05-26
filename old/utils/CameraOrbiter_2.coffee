define (require) ->
  { Vec3 } = require('pex/geom')
  degToRad = 1/180.0 * Math.PI

  class CameraOrbiter
    target: new Vec3(0,0,0)
    constructor: (@camera, @distance = 3, @theta=0, @phi=0) ->
      @update()

    evalPos: (pos, r, theta, phi) ->
      pos.x = @target.x + r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad)
      pos.y = @target.y + r * Math.cos(theta * degToRad)
      pos.z = @target.z + r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad)

    update: () ->
      pos = @camera.getPosition()
      @evalPos(pos, @distance, @theta - 90, @phi - 180)
      @camera.setPosition(pos)