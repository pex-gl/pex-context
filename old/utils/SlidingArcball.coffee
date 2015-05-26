define (require) ->
  CameraOrbiter = require('utils/CameraOrbiter')
  { MathUtils } = require('pex/utils')

  class SlidingArcball extends CameraOrbiter
    allowZooming: true
    enabled: true
    velocityX: 0
    release: false
    maxSpeed: 20
    friction: 0.05
    targetLookoutTheta: 0
    lookoutTheta: 0
    rotationPhi: 0
    targetLookoutPhi: 0
    lookoutPhi: 0
    lookoutStrength: 0.2
    targetMinY: -350
    targetMaxY: 200
    constructor: (@window, camera, distance) ->
      super(camera, distance)

      @distance = distance || 2;
      @minDistance = distance/2 || 0.3;
      @maxDistance = distance*2 || 5;

      @addEventHanlders()

    addEventHanlders: () ->
      @window.on 'leftMouseDown', (e) =>
        return if e.handled || !@enabled
        @velocityX = 0
        @release = false

      @window.on 'leftMouseUp', (e) =>
        return if e.handled || !@enabled
        @release = true

      @window.on 'mouseMoved', (e) =>
        return if e.handled || !@enabled
        h2 = @window.height/2
        w2 = @window.width/2
        @targetLookoutPhi = - (e.x - w2) / w2 * 60 * @lookoutStrength
        @targetLookoutTheta = (e.y - h2) / h2 * 30

      @window.on 'mouseDragged', (e) =>
        return if e.handled || !@enabled
        @velocityX = (@velocityX + e.dx / 2)/2
        if @velocityX > @maxSpeed then @velocityX = @maxSpeed
        if @velocityX < -@maxSpeed then @velocityX = -@maxSpeed
        @rotationPhi -= @velocityX

      @window.on 'scrollWheel', (e) =>
        return if e.handled || !@enabled
        return if !@allowZooming
        @distance = Math.min(@maxDistance, Math.max(@distance + e.dy/100*(@maxDistance-@minDistance), @minDistance))
        @update()
        return false

    setTarget: (target) ->
      @target = target
      @update()

    update: () ->
      @camera.setTarget(@target)
      if @release
        @velocityX *= 1 - @friction
        @rotationPhi -= @velocityX

      @lookoutPhi += (@targetLookoutPhi - @lookoutPhi) * 0.1
      @lookoutTheta += (@targetLookoutTheta - @lookoutTheta) * 0.1

      @camera.target.y = MathUtils.map(@distance, @maxDistance, @minDistance, @targetMinY, @targetMaxY)

      @phi = (@rotationPhi + @lookoutPhi) % 720
      @theta = @lookoutTheta
      super()
