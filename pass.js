import { checkProps } from "./utils.js";

/**
 * @typedef {import("./types.js").PexResource} PassOptions
 * @property {import("./types.js").PexTexture2D[] | import("./framebuffer.js").Attachment[]} [color] render target
 * @property {import("./types.js").PexTexture2D} [depth] render target
 * @property {import("./types.js").Color} [clearColor]
 * @property {number} [clearDepth]
 */

const allowedProps = [
  "name",
  "framebuffer",
  "color",
  "depth",
  "clearColor",
  "clearDepth",
];

function createPass(ctx, opts) {
  checkProps(allowedProps, opts);

  const pass = {
    class: "pass",
    opts,
    clearColor: opts.clearColor,
    clearDepth: opts.clearDepth,
    _dispose() {
      this.opts = null;
      this.clearColor = null;
      this.clearDepth = null;
      if (this.framebuffer) {
        ctx.dispose(this.framebuffer);
        this.framebuffer = null;
      }
    },
  };

  // Inherits framebuffer from parent command or screen, if no target specified
  if (opts.color || opts.depth) {
    pass.framebuffer = ctx.framebuffer(opts);
    const colorsToResolve = opts.color?.filter((attachment) => attachment.resolveTarget)
    const depthToResolve = opts.depth?.resolveTarget ? opts.depth : null
    if (colorsToResolve.length || depthToResolve) {
      const resolveOpts = {
        blitMask: 0,
        name: (opts.name ? opts.name + '_' : '') + "resolve"
      }
      if (colorsToResolve.length) {
        resolveOpts.blitMask ||= ctx.gl.COLOR_BUFFER_BIT
        resolveOpts.color = colorsToResolve.map((attachment) => attachment.resolveTarget)
      }
      if (depthToResolve) {
        resolveOpts.blitMask ||= ctx.gl.DEPTH_BUFFER_BIT
        resolveOpts.depth = opts.depth.resolveTarget
      }
      console.log('resolve framebuffer needed', resolveOpts, pass)
      pass.resolveFramebuffer = ctx.framebuffer(resolveOpts);
    }
  }



  return pass;
}

export default createPass;
