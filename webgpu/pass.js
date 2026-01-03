/**
 * WebGPU Pass - Render passes (framebuffers and clear operations)
 */

/**
 * Create a render pass
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} pass resource
 */
export default function createPass(ctx, opts) {
  const clearColor = opts.clearColor || [0, 0, 0, 1];
  const clearDepth = opts.clearDepth ?? 1;
  const colorTargets = opts.color || [];
  const depthTarget = opts.depth;

  // Track if this is a screen pass or render-to-texture
  const isScreenPass = colorTargets.length === 0 && !depthTarget;

  // Create depth texture for screen pass if not provided
  let screenDepthTexture = null;

  const pass = {
    class: "pass",
    clearColor,
    clearDepth,
    colorTargets,
    depthTarget,
    isScreenPass,
    screenDepthTexture,

    /**
     * Get render pass descriptor for this frame
     * @param {Object} ctx - Context
     * @returns {Object} descriptor
     */
    descriptor(ctx) {
      const colorAttachments = [];
      const colors = Array.isArray(clearColor[0]) ? clearColor : [clearColor];

      if (isScreenPass) {
        // Render to screen
        colorAttachments.push({
          view: ctx.context.getCurrentTexture().createView(),
          clearValue: {
            r: colors[0][0],
            g: colors[0][1],
            b: colors[0][2],
            a: colors[0][3],
          },
          loadOp: "clear",
          storeOp: "store",
        });
      } else {
        // Render to texture(s)
        for (let i = 0; i < colorTargets.length; i++) {
          const target = colorTargets[i];
          const texture = target.texture || target;
          const color = colors[i] || colors[0];

          colorAttachments.push({
            view: texture.gpuTextureView,
            clearValue: { r: color[0], g: color[1], b: color[2], a: color[3] },
            loadOp: "clear",
            storeOp: "store",
          });
        }
      }

      const desc = {
        colorAttachments,
      };

      // Add depth attachment
      if (depthTarget) {
        desc.depthStencilAttachment = {
          view: depthTarget.gpuTextureView,
          depthClearValue: clearDepth,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        };
      } else if (isScreenPass && clearDepth !== undefined) {
        // Create/reuse screen depth texture
        if (
          !this.screenDepthTexture ||
          this.screenDepthTexture.width !== ctx.width ||
          this.screenDepthTexture.height !== ctx.height
        ) {
          if (this.screenDepthTexture) {
            this.screenDepthTexture.destroy();
          }
          this.screenDepthTexture = ctx.device.createTexture({
            size: [ctx.width, ctx.height],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
          });
        }
        desc.depthStencilAttachment = {
          view: this.screenDepthTexture.createView(),
          depthClearValue: clearDepth,
          depthLoadOp: "clear",
          depthStoreOp: "store",
        };
      }

      return desc;
    },

    _dispose() {
      if (this.screenDepthTexture) {
        this.screenDepthTexture.destroy();
      }
    },
  };

  return pass;
}
