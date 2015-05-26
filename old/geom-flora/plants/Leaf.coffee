define (require) ->
  { Window } = require('pex/sys')
  { map } = require('pex/utils/MathUtils')
  { PI, sin, cos, max } = Math
  { Color } = require('pex/color')
  { Vec3, Quat, Spline3D } = require('pex/geom')
  { map, randomFloat, seed } = require('pex/utils/MathUtils')

  Window.create
    settings:
      width: 1280,
      height: 720,
      type: '2d',
      vsync: true,
      multisample: true,
      fullscreen: false,
      center: true
    init: () ->
      { canvas, paint } = this

      @spread = 10
      @ridges = 1

      @ratioChange = 0.1
      @numLines = 12

      @randomSeedValue = 0

      @on 'mouseMoved', (e) =>
        if e.shift
          @ridges = map(e.y, @height, 0, 0.5, 2)
        else
          @spread = map(e.x, 0, @width, 0, 180 / @numLines)
          @ratioChange = map(e.y, 0, @height, 0.05, 1/(@numLines+1)) #

      @on 'leftMouseDown', (e) =>
        @randomSeedValue = Math.random() * 1000

    drawLine: (from, to, color, scale) ->
      @paint.setColor(color.r * 255, color.g * 255, color.b * 255, 255)
      @paint.setStroke()
      @paint.setFlags(@paint.kAntiAliasFlag)
      @canvas.drawLine(@paint, from.x*scale, scale - from.y*scale, to.x*scale, scale - to.y*scale)

    drawLeaf: (ratioChange, spread, ridges, size) ->
      startRatio = 1

      @lines = []
      ratio = startRatio
      lineColor = Color.Yellow
      for i in [0...@numLines]
        from = new Vec3(-0.02, 0, 0)
        to = new Vec3(0, ratio, 0)
        if i % 2 == 1
          to.y *= ridges
        @lines.push({from:from, to:to})
        ratio -= ratioChange

      rotation = new Quat()
      axis = new Vec3(0, 0, 1)
      expandedLines = @lines.map (line, lineIndex) =>
        rotation.setAxisAngle(axis, spread * lineIndex)
        result = {
          from : line.from.dup()
          to: line.to.dup().transformQuat(rotation)
        }

      for line, lineIndex in expandedLines
        if lineIndex % 2 == 1
          lineColor = Color.Orange
        else
          lineColor = Color.Yellow
        @drawLine(line.from, line.to, lineColor, size)

      splineControlPoints = expandedLines.map (line) ->
        line.to

      splineControlPoints.push(new Vec3(-0.03, -0.01, 0))
      splineControlPoints.push(new Vec3(-0.01, -0.1, 0))
      splineControlPoints.push(new Vec3(0, -0.2, 0))

      spline = new Spline3D(splineControlPoints)


      numSamplePoints = 50
      points = [0...numSamplePoints].map (i) ->
        spline.getPoint(i/(numSamplePoints-1))

      for i in [0...numSamplePoints-1]
        @drawLine(points[i], points[i+1], Color.Red, size)

      for p in points
        p.x *= -1

      for i in [0...numSamplePoints-1]
        @drawLine(points[i], points[i+1], Color.Red, size)

    draw: () ->
      @canvas.drawColor(40, 40, 40, 255)
      @drawLine(Vec3.Zero, Vec3.Zero, Color.Red, 0)

      seed(@randomSeedValue)

      leafSize = 200
      numLeavesX = Math.floor(@width / leafSize)
      numLeavesY = Math.floor(@height / leafSize)

      for x in [0...numLeavesX]
        for y in [0...numLeavesY]
          @canvas.save()
          @canvas.translate(
            leafSize/2 + x * leafSize + (@width - leafSize * numLeavesX)/2
            leafSize/2 + y * leafSize + (@height - leafSize * numLeavesY)/2 - leafSize*0.4
          )
          if x == 0 && y == 0
            @drawLeaf(@ratioChange, @spread, @ridges, leafSize * 0.5)
          else
            @drawLeaf(randomFloat(0.1, 1 / (@numLines+1)) , randomFloat(5, 180 / @numLines), randomFloat(0.5, @ridges), leafSize * 0.5)
          @canvas.restore()


