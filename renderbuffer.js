const assert = require('assert')

function createRenderbuffer (ctx, opts) {
  const gl = ctx.gl

  const renderbuffer = {
    class: 'renderbuffer',
    handle: gl.createRenderbuffer(),
    target: gl.RENDERBUFFER,
    width: 0,
    height: 0,
    _update: updateRenderbuffer,
    _dispose: function () {
      gl.deleteRenderbuffer(this.handle)
      this.color = null
      this.depth = null
    }
  }

  updateRenderbuffer(ctx, renderbuffer, opts)

  return renderbuffer
}

// opts = { width: int, height: int, pixelFormat: PixelFormat }
function updateRenderbuffer (ctx, renderbuffer, opts) {
  Object.assign(renderbuffer, opts)

  const gl = ctx.gl

  assert(renderbuffer.pixelFormat === ctx.PixelFormat.Depth16, 'Only PixelFormat.Depth16 is supported for renderbuffers')
  renderbuffer.format = gl.DEPTH_COMPONENT16

  gl.bindRenderbuffer(renderbuffer.target, renderbuffer.handle)
  gl.renderbufferStorage(renderbuffer.target, renderbuffer.format, renderbuffer.width, renderbuffer.height)
  gl.bindRenderbuffer(renderbuffer.target, null)
}

module.exports = createRenderbuffer
