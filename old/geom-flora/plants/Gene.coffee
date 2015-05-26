define (require) ->

  Function::property = (prop, desc) ->
    Object.defineProperty @prototype, prop, desc

  class Gene
    constructor: (@name, @value, @min, @max, options) ->
      @options = options || {}
      if typeof(@options.type) == 'undefined' then @options.type = 'float'
      if typeof(@options.enabled) == 'undefined' then @options.enabled = true
      @enabled = @options.enabled
      @defaultValue = @value

    @property 'normalizedValue',
      get: () ->
        (@value - @min)/(@max-@min)
      set: (value) ->
        @value = @min + value * (@max - @min)
        if @type == 'int'
          @value = Math.round(@value)

    @property 'intValue',
      get: () ->
        Math.round(@value)
