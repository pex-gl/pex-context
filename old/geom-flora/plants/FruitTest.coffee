plask = require('plask')

{ sin, cos, abs, PI, max, log, pow, exp, min } = Math

plask.simpleWindow({
  settings: {
    width: 800,
    height: 600
  },
  init: () ->
  draw: () ->
    @canvas.drawColor(50, 50, 50, 255)
    @paint.setFill()
    @paint.setColor(255,255,255,255)

    cx = @width/2
    cy = @height/2
    maxR = 150
    r = maxR

    for a in [0..PI] by PI/36
      r = maxR * (1 - cos(a))
      x = cx + r * cos(a)
      y = cy + r * sin(a)
      @canvas.drawRect(@paint, x-1, y-1, x+2, y+2)

    @paint.setColor(0,255,255,255)

    clamp = (a, lo, hi) ->
      lo if a < lo
      hi if a > hi
      a

    mix = (a, b, t) ->
      a + (b - a) * t

    smin = (a, b, k) ->
      a = -a
      b = -b
      res = exp(-k*a ) + exp(-k*b )
      log(res)/k

    smin2 = (a, b, k) ->
      a = -a
      b = -b
      h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 )
      -mix( b, a, h ) - k*h*(1.0-h)

    smin3 = (a, b, k ) ->
      a = 1-a
      b = 1-b
      a = pow( a, k )
      b = pow( b, k )
      1.0 - pow( (a*b)/(a+b), 1.0/k )

    for a in [-0..3] by PI/100
      x = cx + @width/2 * a/3 - 200
      y = cy - 100 * smin3(0.5*max(0, sin(a*2)), 0.95*max(0, sin(a*2-2.3)), 2)
      @canvas.drawRect(@paint, x-1, y-1, x+2, y+2)

})