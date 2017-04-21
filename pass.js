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
    framebuffer: opts.framebuffer,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth
  }

  if (opts.color || opts.depth) {
    if (!ctx.defaultState.pass.sharedFramebuffer) {
      ctx.defaultState.pass.sharedFramebuffer = ctx.framebuffer({})
    }
    pass.framebuffer = {
      target: ctx.defaultState.pass.sharedFramebuffer.target,
      handle: ctx.defaultState.pass.sharedFramebuffer.handle,
      shared: ctx.defaultState.pass.sharedFramebuffer
    }
    // pass.framebuffer = ctx.framebuffer(opts)
  }

  if (!pass.framebuffer) {
    pass.framebuffer = ctx.defaultState.pass.framebuffer
  }

  return pass
}

module.exports = createPass
