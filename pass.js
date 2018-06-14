const checkProps = require('./check-props')

const allowedProps = [
  'name',
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
    clearDepth: opts.clearDepth,
    _dispose: function () {
      this.opts = null
      this.clearColor = null
      this.clearDepth = null
      if (this.framebuffer === ctx.defaultState.pass.sharedFramebuffer) {
        if (--ctx.defaultState.pass.sharedFramebuffer.refCount === 0) {
          ctx.defaultState.pass.sharedFramebuffer._dispose()
          ctx.defaultState.pass.sharedFramebuffer = null
        }
      }
      this.framebuffer = null
    }
  }

  if (opts.color || opts.depth) {
    if (!ctx.defaultState.pass.sharedFramebuffer) {
      ctx.defaultState.pass.sharedFramebuffer = ctx.framebuffer({})
    }
    pass.framebuffer = ctx.defaultState.pass.sharedFramebuffer
    ctx.defaultState.pass.sharedFramebuffer.refCount++
  }

  // default screen framebuffer
  if (!pass.framebuffer) {
    pass.framebuffer = ctx.defaultState.pass.framebuffer
  }

  return pass
}

module.exports = createPass
