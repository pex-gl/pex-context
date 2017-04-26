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
    opts: opts,
    // framebuffer: opts.framebuffer,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth
  }

  if (opts.color || opts.depth) {
    if (!ctx.defaultState.pass.sharedFramebuffer) {
      ctx.defaultState.pass.sharedFramebuffer = ctx.framebuffer({})
    }
    pass.framebuffer = ctx.defaultState.pass.sharedFramebuffer
  }

  if (!pass.framebuffer) {
    pass.framebuffer = ctx.defaultState.pass.framebuffer
  }

  return pass
}

module.exports = createPass
