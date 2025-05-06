import { NAMESPACE } from "./utils.js";

/**
 * @typedef {object} Attachment
 * @property {import("./types.js").PexResource} texture
 * @property {WebGLRenderingContext.FRAMEBUFFER} target
 */

function createFramebuffer(ctx, opts) {
  const gl = ctx.gl;

  const framebuffer = {
    class: "framebuffer",
    handle: gl.createFramebuffer(),
    target: gl.FRAMEBUFFER,
    name: `framebuffer${opts.name ? '_' + opts.name : ''}`,
    drawBuffers: [],
    color: [],
    depth: null,
    width: 0,
    height: 0,
    refCount: 0,
    _update: updateFramebuffer,
    _dispose() {
      gl.deleteFramebuffer(this.handle);
      this.color = null;
      this.depth = null;
    },
  };

  if (opts.color || opts.depth) {
    updateFramebuffer(ctx, framebuffer, opts);
  }

  return framebuffer;
}

// opts = { color: [texture] }
// opts = { color: [texture], depth }
// opts = { color: [{texture, target}], depth }
function updateFramebuffer(ctx, framebuffer, opts) {
  const gl = ctx.gl;

  // TODO: if color.length > 1 check for WebGL2 or gl.getExtension('WEBGL_draw_buffers')
  framebuffer.color = opts.color ? opts.color.map((attachment, i) => {
    const colorAttachment = attachment.texture
      ? attachment
      : { texture: attachment };
    colorAttachment.level = 0; // we can't render to mipmap level other than 0 in webgl
    if (!colorAttachment.target) {
      colorAttachment.target = colorAttachment.texture.target;
    }
    return colorAttachment;
  }) : [];

  framebuffer.depth = opts.depth
    ? opts.depth.texture
      ? opts.depth
      : { texture: opts.depth }
    : null;

  framebuffer.width = (framebuffer.color[0] || framebuffer.depth).texture.width;
  framebuffer.height = (framebuffer.color[0] || framebuffer.depth).texture.height;

  // TODO: ctx push framebuffer
  gl.bindFramebuffer(framebuffer.target, framebuffer.handle);

  framebuffer.drawBuffers.length = 0;

  framebuffer.color.forEach((colorAttachment, i) => {
    framebuffer.drawBuffers.push(gl.COLOR_ATTACHMENT0 + i);
    if (colorAttachment.target === gl.RENDERBUFFER) {
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + i,
        gl.RENDERBUFFER,
        //TODO: can we make this not the case?
        colorAttachment.handle || colorAttachment.texture.handle
      );
    } else {
      gl.framebufferTexture2D(
        framebuffer.target,
        gl.COLOR_ATTACHMENT0 + i,
        colorAttachment.target,
        colorAttachment.texture.handle,
        colorAttachment.level,
      );
    }
  });

  //unbind any unused attachments
  for (
    let i = framebuffer.color.length;
    i < ctx.capabilities.maxColorAttachments;
    i++
  ) {
    gl.framebufferTexture2D(
      framebuffer.target,
      gl.COLOR_ATTACHMENT0 + i,
      gl.TEXTURE_2D,
      null,
      0,
    );
  }

  if (framebuffer.depth) {
    if (ctx.debugMode) {
      console.debug(NAMESPACE, "fbo attaching depth", framebuffer.depth);
    }

    const depthAttachment = framebuffer.depth;

    if (depthAttachment.texture.target === gl.RENDERBUFFER) {
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthAttachment.texture.handle,
      );
    } else {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        depthAttachment.texture.target,
        depthAttachment.texture.handle,
        depthAttachment.level,
      );
    }
  } else {
    if (ctx.debugMode) console.debug(NAMESPACE, "fbo deattaching depth");
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      null,
    );
    gl.framebufferTexture2D(
      framebuffer.target,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      null,
      0,
    );
  }

  if (ctx.debugMode) {
    const fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    console.assert(
      fboStatus === gl.FRAMEBUFFER_COMPLETE,
      `FBO incomplete ${ctx.getGLString(fboStatus)}`,
    );
  }

  // TODO: ctx. pop framebuffer
  gl.bindFramebuffer(framebuffer.target, null);
}

export default createFramebuffer;
