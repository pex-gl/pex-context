import { NAMESPACE } from "./utils.js";

/**
 * @typedef {Object} Attachment
 * @property {import("./types.js").PexResource} texture
 * @property {WebGLRenderingContext.FRAMEBUFFER|WebGL2RenderingContext.READ_FRAMEBUFFER|WebGL2RenderingContext.DRAW_FRAMEBUFFER} target
 */

function createFramebuffer(ctx, opts) {
  const gl = ctx.gl;

  const framebuffer = {
    class: "framebuffer",
    handle: gl.createFramebuffer(),
    target: gl.FRAMEBUFFER,
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
  framebuffer.color = opts.color.map((attachment) => {
    if (attachment.target === gl.RENDERBUFFER) return attachment;

    const colorAttachment = attachment.texture
      ? attachment
      : { texture: attachment };
    colorAttachment.level = 0; // we can't render to mipmap level other than 0 in webgl
    if (!colorAttachment.target) {
      colorAttachment.target = colorAttachment.texture.target;
    }
    return colorAttachment;
  });

  framebuffer.depth = opts.depth
    ? opts.depth.texture
      ? opts.depth
      : { texture: opts.depth }
    : null;

  // Set dimensions from render buffer or texture
  framebuffer.width =
    framebuffer.color[0].width || framebuffer.color[0].texture.width;
  framebuffer.height =
    framebuffer.color[0].height || framebuffer.color[0].texture.height;

  // TODO: ctx push framebuffer
  gl.bindFramebuffer(framebuffer.target, framebuffer.handle);

  framebuffer.drawBuffers.length = 0;

  framebuffer.color.forEach((colorAttachment, i) => {
    if (colorAttachment.target === gl.RENDERBUFFER) {
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0 + i,
        gl.RENDERBUFFER,
        colorAttachment.handle
      );
    } else {
      framebuffer.drawBuffers.push(gl.COLOR_ATTACHMENT0 + i);
      gl.framebufferTexture2D(
        framebuffer.target,
        gl.COLOR_ATTACHMENT0 + i,
        colorAttachment.target,
        colorAttachment.texture.handle,
        colorAttachment.level
      );
    }
  });

  // Attachment is a texture or a render buffer
  for (
    let i = framebuffer.color.length;
    i < ctx.capabilities.maxColorAttachments;
    i++
  ) {
    if (framebuffer.target === gl.RENDERBUFFER) {
      // gl.framebufferTexture2D(
      //   gl.FRAMEBUFFER,
      //   gl.COLOR_ATTACHMENT0 + i,
      //   gl.TEXTURE_2D,
      //   framebuffer.color[i].texture, // TODO: Where would that be from
      //   0
      // );
    } else {
      gl.framebufferTexture2D(
        framebuffer.target,
        gl.COLOR_ATTACHMENT0 + i,
        gl.TEXTURE_2D,
        null,
        0
      );
    }
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
        depthAttachment.texture.handle
      );
    } else {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        depthAttachment.texture.target,
        depthAttachment.texture.handle,
        depthAttachment.level
      );
    }
  } else {
    if (ctx.debugMode) console.debug(NAMESPACE, "fbo deattaching depth");
    if (ctx.debugMode) console.debug(NAMESPACE, "FBO", framebuffer, opts);
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      null
    );
    gl.framebufferTexture2D(
      framebuffer.target,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      null,
      0
    );
  }

  if (ctx.debugMode) {
    const fboStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    console.assert(
      fboStatus === gl.FRAMEBUFFER_COMPLETE,
      `FBO incomplete ${ctx.getGLString(fboStatus)}`
    );
  }

  // TODO: ctx. pop framebuffer
  gl.bindFramebuffer(framebuffer.target, null);
}

export default createFramebuffer;
