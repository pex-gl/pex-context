define (require) ->
  Time = require('pex/utils/Time')

  Function::property = (prop, desc) ->
    Object.defineProperty @prototype, prop, desc

  class AnimatedFloat
    constructor: (f, @initialDelay=0) ->
      @initialValue = f
      @value = f
      @_target = f

    update: () ->
      if @delay > 0
        @delay -= Time.delta
      else
        @value += (@_target - @value) * 0.1

    @property 'target',
      get: () -> @_target
      set: (value) ->
        if @_target != value
          @_target = value
          @delay = @initialDelay
