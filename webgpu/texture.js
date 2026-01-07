/**
 * WebGPU Texture - 2D textures including depth
 */

// Map pex-context pixel formats to WebGPU formats
const PIXEL_FORMAT_MAP = {
  rgba8unorm: "rgba8unorm",
  depth16unorm: "depth16unorm",
  depth24plus: "depth24plus",
  depth32float: "depth32float",
  // Legacy pex-context format names
  RGBA8: "rgba8unorm",
  DEPTH_COMPONENT16: "depth16unorm",
  DEPTH_COMPONENT24: "depth24plus",
  DEPTH_COMPONENT32F: "depth32float",
};

/**
 * Create a 2D texture
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} texture resource
 */
/**
 * Create a cubemap texture
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} texture resource
 */
export function createTextureCube(ctx, opts) {
  const { device } = ctx;

  const width = opts.width || 512;
  const height = opts.height || 512;
  const pixelFormat = PIXEL_FORMAT_MAP[opts.pixelFormat] || "rgba8unorm";

  // Create cubemap texture (6 layers)
  const gpuTexture = device.createTexture({
    size: [width, height, 6],
    format: pixelFormat,
    dimension: "2d",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_DST,
  });

  // Create cube view for sampling
  const gpuTextureView = gpuTexture.createView({
    dimension: "cube",
  });

  // Create individual face views for rendering to each face
  const faceViews = [];
  for (let i = 0; i < 6; i++) {
    faceViews.push(
      gpuTexture.createView({
        dimension: "2d",
        baseArrayLayer: i,
        arrayLayerCount: 1,
      }),
    );
  }

  const texture = {
    class: "textureCube",
    gpuTexture,
    gpuTextureView,
    faceViews,
    width,
    height,
    format: pixelFormat,
    isCube: true,

    _dispose() {
      if (gpuTexture) {
        gpuTexture.destroy();
      }
    },
  };

  return texture;
}

/**
 * Create a 2D texture
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} texture resource
 */
export default function createTexture(ctx, opts) {
  const { device } = ctx;

  const width = opts.width || 1;
  const height = opts.height || 1;
  const pixelFormat = PIXEL_FORMAT_MAP[opts.pixelFormat] || "rgba8unorm";

  // Determine if this is a depth texture
  const isDepth = pixelFormat.includes("depth");

  // Determine usage
  let usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST;
  if (isDepth || opts.renderTarget) {
    usage |= GPUTextureUsage.RENDER_ATTACHMENT;
  }
  if (opts.data) {
    usage |= GPUTextureUsage.COPY_DST;
  }

  // Create texture
  const gpuTexture = device.createTexture({
    size: [width, height],
    format: pixelFormat,
    usage,
  });

  // Create view
  const gpuTextureView = gpuTexture.createView();

  // Upload data if provided
  if (opts.data && !isDepth) {
    let data = opts.data;
    if (Array.isArray(data)) {
      data = new Uint8Array(data);
    }

    device.queue.writeTexture(
      { texture: gpuTexture },
      data,
      { bytesPerRow: width * 4 },
      { width, height },
    );
  }

  const texture = {
    class: "texture",
    gpuTexture,
    gpuTextureView,
    width,
    height,
    format: pixelFormat,
    isDepth,

    _update(ctx, texture, updateOpts) {
      if (updateOpts.data && !texture.isDepth) {
        let data = updateOpts.data;
        if (Array.isArray(data)) {
          data = new Uint8Array(data);
        }
        ctx.device.queue.writeTexture(
          { texture: texture.gpuTexture },
          data,
          { bytesPerRow: texture.width * 4 },
          { width: texture.width, height: texture.height },
        );
      }
    },

    _dispose() {
      if (gpuTexture) {
        gpuTexture.destroy();
      }
    },
  };

  return texture;
}
