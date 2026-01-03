/**
 * WebGPU Buffer - Vertex, Index, and Uniform buffers
 */

/**
 * Create a GPU buffer
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} buffer resource
 */
export default function createBuffer(ctx, opts) {
  const { device } = ctx;
  const type = opts.type || "vertex";

  let data = opts.data;
  let gpuBuffer;
  let byteLength;
  let format = "uint16";
  let count = 0;
  let stride = 0;

  // Determine usage flags
  let usage = GPUBufferUsage.COPY_DST;
  if (type === "vertex") {
    usage |= GPUBufferUsage.VERTEX;
  } else if (type === "index") {
    usage |= GPUBufferUsage.INDEX;
  } else if (type === "uniform") {
    usage |= GPUBufferUsage.UNIFORM;
  }

  if (data) {
    // Convert data to typed array if needed
    if (Array.isArray(data)) {
      if (type === "index") {
        // Flatten nested arrays for indices
        if (data.length > 0 && Array.isArray(data[0])) {
          data = data.flat();
        }
        data = new Uint16Array(data);
        format = "uint16";
      } else {
        // Flatten nested arrays for vertices
        if (data.length > 0 && Array.isArray(data[0])) {
          stride = data[0].length;
          data = data.flat();
        }
        data = new Float32Array(data);
      }
    } else if (ArrayBuffer.isView(data)) {
      // Handle existing TypedArrays - ensure correct type
      if (type === "index") {
        if (!(data instanceof Uint16Array || data instanceof Uint32Array)) {
          // Convert from other typed array (e.g., Uint8Array to Uint16Array)
          data = new Uint16Array(data);
        }
        format = data instanceof Uint32Array ? "uint32" : "uint16";
      } else if (type === "vertex") {
        if (!(data instanceof Float32Array)) {
          data = new Float32Array(data);
        }
      }
    }

    byteLength = data.byteLength;
    count = type === "index" ? data.length : 0;

    // Determine format for index buffers
    if (type === "index") {
      if (data instanceof Uint32Array) {
        format = "uint32";
      } else {
        format = "uint16";
      }
      count = data.length;
    }

    // Create buffer
    gpuBuffer = device.createBuffer({
      size: byteLength,
      usage,
      mappedAtCreation: true,
    });

    // Copy data using byte-level copy for safety
    const mappedRange = gpuBuffer.getMappedRange();
    new Uint8Array(mappedRange).set(
      new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    );
    gpuBuffer.unmap();
  } else if (opts.size) {
    // Create empty buffer of specified size
    byteLength = opts.size;
    gpuBuffer = device.createBuffer({
      size: byteLength,
      usage,
    });
  }

  const buffer = {
    class: "buffer",
    type,
    gpuBuffer,
    byteLength,
    format,
    count,
    stride,

    _update(ctx, buffer, updateOpts) {
      let newData = updateOpts.data;

      if (Array.isArray(newData)) {
        if (newData.length > 0 && Array.isArray(newData[0])) {
          newData = newData.flat();
        }
        if (type === "index") {
          newData = new Uint16Array(newData);
        } else {
          newData = new Float32Array(newData);
        }
      }

      if (newData) {
        ctx.device.queue.writeBuffer(buffer.gpuBuffer, 0, newData);
      }
    },

    _dispose() {
      if (gpuBuffer) {
        gpuBuffer.destroy();
      }
    },
  };

  return buffer;
}
