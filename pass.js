import { checkProps } from "./utils.js";

/**
 * @typedef {import("./types.js").PexResource} PassOptions
 * @property {Texture2D[]|import("./framebuffer.js").Attachment[]} [color] render target
 * @property {Texture2D} [depth] render target
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
  if (opts.color || opts.depth) pass.framebuffer = ctx.framebuffer(opts);

  return pass;
}

export default createPass;
