/**
 * WebGPU pex-context API - Main Context Factory
 *
 * This module provides a pex-context compatible API using WebGPU as backend.
 */

import createBuffer from "./buffer.js";
import createTexture from "./texture.js";
import createPipeline from "./pipeline.js";
import createPass from "./pass.js";
import createSampler from "./sampler.js";

let ID = 0;

/**
 * Create a WebGPU context
 * @param {Object} options
 * @param {HTMLCanvasElement} [options.canvas]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {number} [options.pixelRatio]
 * @param {boolean} [options.debug]
 * @returns {Promise<Object>} ctx
 */
export default async function createContext(options = {}) {
  const opts = {
    pixelRatio: 1,
    debug: false,
    ...options,
  };

  // Get or create canvas
  let canvas = opts.canvas;
  if (!canvas) {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
  }

  // Set canvas size
  const width = opts.width || canvas.clientWidth || 640;
  const height = opts.height || canvas.clientHeight || 480;
  const pixelRatio = Math.min(opts.pixelRatio, window.devicePixelRatio);

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  // Initialize WebGPU
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("No WebGPU adapter found");
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });

  // Resources tracking
  const resources = [];
  const stats = {};

  /**
   * @namespace ctx
   */
  const ctx = {
    // Internal state
    device,
    context,
    format,
    canvas,
    pixelRatio,

    // Debug mode
    debugMode: opts.debug,

    // Getters
    get width() {
      return canvas.width;
    },
    get height() {
      return canvas.height;
    },

    // Resource tracking
    resources,
    stats,

    resource(res) {
      res.id = `${res.class}_${ID++}`;
      this.stats[res.class] ||= { alive: 0, total: 0 };
      this.stats[res.class].alive++;
      this.stats[res.class].total++;
      this.resources.push(res);
      return res;
    },

    // Debug
    debug(enabled) {
      this.debugMode = enabled;
    },

    /**
     * Render loop
     * @param {Function} cb - Frame callback
     */
    frame(cb) {
      const frameLoop = () => {
        if (cb() === false) return;
        requestAnimationFrame(frameLoop);
      };
      requestAnimationFrame(frameLoop);
    },

    /**
     * Create a render pass
     * @param {Object} opts
     * @returns {Object} pass
     */
    pass(opts) {
      if (this.debugMode) console.debug("[webgpu-ctx] pass", opts);
      return this.resource(createPass(this, opts));
    },

    /**
     * Create a render pipeline
     * @param {Object} opts
     * @returns {Object} pipeline
     */
    pipeline(opts) {
      if (this.debugMode) console.debug("[webgpu-ctx] pipeline", opts);
      return this.resource(createPipeline(this, opts));
    },

    /**
     * Create a vertex buffer
     * @param {Array|TypedArray} data
     * @returns {Object} buffer
     */
    vertexBuffer(data) {
      if (this.debugMode) console.debug("[webgpu-ctx] vertexBuffer");
      const opts =
        Array.isArray(data) || ArrayBuffer.isView(data) ? { data } : data;
      opts.type = "vertex";
      return this.resource(createBuffer(this, opts));
    },

    /**
     * Create an index buffer
     * @param {Array|TypedArray} data
     * @returns {Object} buffer
     */
    indexBuffer(data) {
      if (this.debugMode) console.debug("[webgpu-ctx] indexBuffer");
      const opts =
        Array.isArray(data) || ArrayBuffer.isView(data) ? { data } : data;
      opts.type = "index";
      return this.resource(createBuffer(this, opts));
    },

    /**
     * Create a uniform buffer
     * @param {Object} opts
     * @returns {Object} buffer
     */
    uniformBuffer(opts) {
      if (this.debugMode) console.debug("[webgpu-ctx] uniformBuffer");
      opts.type = "uniform";
      return this.resource(createBuffer(this, opts));
    },

    /**
     * Create a 2D texture
     * @param {Object} opts
     * @returns {Object} texture
     */
    texture2D(opts) {
      if (this.debugMode) console.debug("[webgpu-ctx] texture2D", opts);
      return this.resource(createTexture(this, opts));
    },

    /**
     * Create a sampler
     * @param {Object} opts
     * @returns {Object} sampler
     */
    sampler(opts) {
      if (this.debugMode) console.debug("[webgpu-ctx] sampler", opts);
      return this.resource(createSampler(this, opts));
    },

    /**
     * Update a resource
     * @param {Object} resource
     * @param {Object} opts
     */
    update(resource, opts) {
      if (this.debugMode)
        console.debug("[webgpu-ctx] update", resource.id, opts);
      if (resource._update) {
        resource._update(this, resource, opts);
      }
    },

    /**
     * Submit a draw command
     * @param {Object} cmd - Command object
     * @param {Function|Object|Array} [batches] - Sub-commands or overrides
     */
    submit(cmd, batches) {
      if (this.debugMode)
        console.debug("[webgpu-ctx] submit", cmd.name || cmd.id);

      // Handle batches/sub-commands
      if (typeof batches === "function") {
        // Nested commands - share a single render pass
        const pass = cmd.pass;
        if (!pass) {
          batches();
          return;
        }

        // Create a single render pass for all nested commands
        const encoder = device.createCommandEncoder();
        const passDescriptor = pass.descriptor(this);
        const renderPass = encoder.beginRenderPass(passDescriptor);

        // Store the shared render pass for nested commands
        this._currentEncoder = encoder;
        this._currentRenderPass = renderPass;
        this._currentPass = pass;

        batches();

        // End the shared render pass
        renderPass.end();
        device.queue.submit([encoder.finish()]);

        this._currentEncoder = null;
        this._currentRenderPass = null;
        this._currentPass = null;
        return;
      }

      if (Array.isArray(batches)) {
        for (const batch of batches) {
          this.submit({ ...cmd, ...batch });
        }
        return;
      }

      if (batches && typeof batches === "object") {
        this.submit({ ...cmd, ...batches });
        return;
      }

      // Execute the command
      this._executeCommand(cmd);
    },

    /**
     * Internal: Execute a single draw command
     * @private
     */
    _executeCommand(cmd) {
      const pipeline = cmd.pipeline;

      // If we're inside a nested submit, use the shared render pass
      if (this._currentRenderPass && pipeline) {
        const renderPass = this._currentRenderPass;
        const bindGroup = this._createBindGroup(cmd, pipeline);

        renderPass.setPipeline(pipeline.gpuPipeline);

        if (bindGroup) {
          renderPass.setBindGroup(0, bindGroup);
        }

        // Set vertex buffers
        if (cmd.attributes) {
          let slot = 0;
          for (const [name, attr] of Object.entries(cmd.attributes)) {
            const buffer = attr.buffer || attr;
            renderPass.setVertexBuffer(slot, buffer.gpuBuffer);
            slot++;
          }
        }

        // Set index buffer and draw
        if (cmd.indices) {
          const indexBuffer = cmd.indices.buffer || cmd.indices;
          renderPass.setIndexBuffer(indexBuffer.gpuBuffer, indexBuffer.format);
          renderPass.drawIndexed(indexBuffer.count);
        } else if (cmd.count) {
          renderPass.draw(cmd.count);
        }

        return;
      }

      // Standalone command - create its own render pass
      const pass = cmd.pass || this._currentPass;

      if (!pipeline) {
        // Pass-only command (clear)
        if (pass) {
          const encoder = device.createCommandEncoder();
          const renderPass = encoder.beginRenderPass(pass.descriptor(this));
          renderPass.end();
          device.queue.submit([encoder.finish()]);
        }
        return;
      }

      // Build bind group from uniforms
      const bindGroup = this._createBindGroup(cmd, pipeline);

      // Create command encoder
      const encoder = device.createCommandEncoder();
      const passDescriptor = pass
        ? pass.descriptor(this)
        : this._defaultPassDescriptor();
      const renderPass = encoder.beginRenderPass(passDescriptor);

      renderPass.setPipeline(pipeline.gpuPipeline);

      if (bindGroup) {
        renderPass.setBindGroup(0, bindGroup);
      }

      // Set vertex buffers
      if (cmd.attributes) {
        let slot = 0;
        for (const [name, attr] of Object.entries(cmd.attributes)) {
          const buffer = attr.buffer || attr;
          renderPass.setVertexBuffer(slot, buffer.gpuBuffer);
          slot++;
        }
      }

      // Set index buffer and draw
      if (cmd.indices) {
        const indexBuffer = cmd.indices.buffer || cmd.indices;
        renderPass.setIndexBuffer(indexBuffer.gpuBuffer, indexBuffer.format);
        renderPass.drawIndexed(indexBuffer.count);
      } else if (cmd.count) {
        renderPass.draw(cmd.count);
      }

      renderPass.end();
      device.queue.submit([encoder.finish()]);
    },

    /**
     * Internal: Create bind group from command uniforms
     * @private
     */
    _createBindGroup(cmd, pipeline) {
      if (!cmd.uniforms || !pipeline.bindGroupLayout) return null;

      const entries = [];
      let binding = 0;

      for (const [name, value] of Object.entries(cmd.uniforms)) {
        if (value.gpuBuffer) {
          // Uniform buffer
          entries.push({
            binding: binding++,
            resource: { buffer: value.gpuBuffer },
          });
        } else if (value.gpuTexture) {
          // Texture
          entries.push({
            binding: binding++,
            resource: value.gpuTextureView || value.gpuTexture.createView(),
          });
        } else if (value.gpuSampler) {
          // Sampler
          entries.push({
            binding: binding++,
            resource: value.gpuSampler,
          });
        }
        // Direct values (matrices, etc.) would need to be written to a uniform buffer first
      }

      if (entries.length === 0) return null;

      return device.createBindGroup({
        layout: pipeline.bindGroupLayout,
        entries,
      });
    },

    /**
     * Internal: Get default pass descriptor for screen rendering
     * @private
     */
    _defaultPassDescriptor() {
      return {
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      };
    },

    /**
     * Dispose resources
     * @param {Object} [resource] - Specific resource or all if undefined
     */
    dispose(resource) {
      if (resource) {
        const idx = this.resources.indexOf(resource);
        if (idx !== -1) {
          this.resources.splice(idx, 1);
          this.stats[resource.class].alive--;
          if (resource._dispose) resource._dispose();
        }
      } else {
        for (const res of this.resources) {
          if (res._dispose) res._dispose();
        }
        this.resources.length = 0;
      }
    },
  };

  // Pixel format enum (subset for basic usage)
  ctx.PixelFormat = {
    RGBA8: "rgba8unorm",
    DEPTH_COMPONENT16: "depth16unorm",
    DEPTH_COMPONENT24: "depth24plus",
    DEPTH_COMPONENT32F: "depth32float",
  };

  return ctx;
}
