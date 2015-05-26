define (require) ->
  { MathUtils } = require('pex/utils')
  { randomElement } = MathUtils
  { random } = Math

  class LSystem
    constructor: (@axiom, @rules) ->

    applyRules: (input) ->
      console.log('apply', input)
      matches = []
      for rule in @rules
        if rule.input[0] == input[0] && rule.input[1] > input[1]
          return rule.output.map((r) ->
            if r[0] == input[0] then [r[0], input[1]+1]
            else r
          )
      return [input]

    generate: (numIterations) ->
      input = @axiom
      if numIterations > 0 then for i in [0..numIterations-1]
        console.log('i', i, 'input', input)
        result = []
        for s in [0..input.length-1]
          #console.log(i, s, input[s])
          r = @applyRules(input[s])
          for re in r
            console.log('return', re)
            result.push(re)
        input = result
        console.log('i', i, 'output', input)
      input
