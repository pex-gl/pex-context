const checkProps = require('./check-props')

const allowedProps = [
  'framebuffer',
  'color', 'depth',
  'clearColor', 'clearDepth'
]

function createPass (ctx, opts) {
  checkProps(allowedProps, opts)

  const pass = {
    class: 'pass',
    framebuffer: opts.framebuffer,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth
  }

  if (opts.color || opts.depth) {
    pass.framebuffer = ctx.framebuffer({
      color: opts.color,
      depth: opts.depth
    })
  }

  if (!pass.framebuffer) {
    pass.framebuffer = ctx.defaultState.pass.framebuffer
  }

  return pass
}

module.exports = createPass
