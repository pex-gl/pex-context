/**
 * WebGPU Sampler - Texture samplers
 */

/**
 * Create a texture sampler
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} sampler resource
 */
export default function createSampler(ctx, opts = {}) {
  const { device } = ctx;

  const minFilter = opts.minFilter || "linear";
  const magFilter = opts.magFilter || "linear";
  const addressModeU = opts.wrapS || opts.wrap || "clamp-to-edge";
  const addressModeV = opts.wrapT || opts.wrap || "clamp-to-edge";
  const compare = opts.compare;

  const descriptor = {
    minFilter,
    magFilter,
    addressModeU,
    addressModeV,
  };

  // Add compare function for shadow samplers
  if (compare) {
    descriptor.compare = compare;
  }

  const gpuSampler = device.createSampler(descriptor);

  const sampler = {
    class: "sampler",
    gpuSampler,

    _dispose() {
      // Samplers don't need explicit disposal in WebGPU
    },
  };

  return sampler;
}
