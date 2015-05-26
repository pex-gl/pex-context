define (require) ->
  { Vec3 } = require('pex/geom')
  class Agent
    constructor: (@position=new Vec3(0,0,0)) ->
      @velocity = new Vec3(0,0,0)
      @forces = []
      @points = []
      @points.push(@position.dup())

    updateSteps: (n, speed) ->
      for i in [0...n]
        for force in @forces
          @velocity.add(force.dup().scale(speed))
        @position.add(@velocity.dup().scale(speed))
        @points.push(@position.dup())
