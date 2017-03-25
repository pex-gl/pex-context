function createFramebuffer (ctx, opts) {
  const gl = ctx.gl

  const framebuffer = {
    class: 'framebuffer',
    handle: gl.createFramebuffer(),
    target: gl.FRAMEBUFFER,
    color: [],
    depth: null,
    width: 0,
    height: 0,
    _update: updateFramebuffer
  }

  updateFramebuffer(ctx, framebuffer, opts)

  return framebuffer
}

// opts = { color: [texture] }
// opts = { color: [texture], depth }
// opts = { color: [{texture, target}], depth }
function updateFramebuffer (ctx, framebuffer, opts) {
  const gl = ctx.gl

  // TODO: if color.length > 1 check for WebGL2 or gl.getExtension('WEBGL_draw_buffers')
  framebuffer.color = opts.color.map((attachment) => {
    const colorAttachment = attachment.texture ? attachment : { texture: attachment }
    colorAttachment.level = 0 // we can't render to mipmap level other than 0 in webgl
    if (!colorAttachment.target) {
      colorAttachment.target = colorAttachment.texture.target
    }
    return colorAttachment
  })

  if (opts.depth && !opts.depth.texture) {
    opts.depth = { texture: opts.depth }
  }
  framebuffer.depth = opts.depth

  framebuffer.width = framebuffer.color[0].texture.width
  framebuffer.height = framebuffer.color[0].texture.height
  // TODO: ctx push framebuffer
  gl.bindFramebuffer(framebuffer.target, framebuffer.handle)

  for (let i = 0; i < framebuffer.color.length; i++) {
    const colorAttachment = framebuffer.color[i]
    console.log('fbo attaching color', colorAttachment)
    gl.framebufferTexture2D(framebuffer.target, gl.COLOR_ATTACHMENT0 + i,
       colorAttachment.target, colorAttachment.texture.handle, colorAttachment.level)
  }
  console.log('fbo', gl.getError())
  console.log('fbo', ctx.getGLString(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))

  if (framebuffer.depth) {
    console.log('fbo attaching depth', framebuffer.depth)
    const depthAttachment = framebuffer.depth
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,
      depthAttachment.texture.target, depthAttachment.texture.handle, depthAttachment.level)
  }
  console.log('fbo', gl.getError())
  console.log('fbo', ctx.getGLString(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))

  // TODO: ctx. pop framebuffer
  gl.bindFramebuffer(framebuffer.target, null)
}

module.exports = createFramebuffer
