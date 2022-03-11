const checkProps = require('./check-props')

const allowedProps = [
  'name',
  'framebuffer',
  'color',
  'depth',
  'clearColor',
  'clearDepth'
]

function createPass(ctx, opts) {
  checkProps(allowedProps, opts)

  const pass = {
    class: 'pass',
    opts: opts,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth,
    _dispose: function() {
      this.opts = null
      this.clearColor = null
      this.clearDepth = null
      if (this.framebuffer) {
        ctx.dispose(this.framebuffer)
        this.framebuffer = null
      }
    }
  }

  // if color or depth targets are present create new framebuffer
  // otherwise we will inherit framebuffer from parent command or screen
  if (opts.color || opts.depth) {
    pass.framebuffer = ctx.framebuffer(opts)
  }

  return pass
}

module.exports = createPass
