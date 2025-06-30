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

    const colorsToResolve = opts.color
      ? opts.color
          .map((attachment, index) => {
            if (attachment.resolveTarget) {
              return { texture: attachment.resolveTarget, sourceIndex: index };
            }
          })
          .filter((a) => a)
      : [];
    const depthToResolve = opts.depth?.resolveTarget;

    if (colorsToResolve.length || depthToResolve) {
      const resolveOpts = {
        name: `${opts.name ? `${opts.name}_` : ""}resolve`,
        color: colorsToResolve,
        depth: depthToResolve,
      };
      pass.resolveFramebuffer = ctx.framebuffer(resolveOpts);
    }
  }

  return pass;
}

export default createPass;
