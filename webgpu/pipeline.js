/**
 * WebGPU Pipeline - Render pipelines with WGSL shaders
 */

/**
 * Create a render pipeline
 * @param {Object} ctx - Context
 * @param {Object} opts - Options
 * @returns {Object} pipeline resource
 */
export default function createPipeline(ctx, opts) {
  const { device, format } = ctx;

  const vert = opts.vert;
  const frag = opts.frag;
  const vertexLayout = opts.vertexLayout || {};
  const depthTest = opts.depthTest !== false;
  const depthWrite = opts.depthWrite !== false;
  const cullFace = opts.cullFace !== false;
  const cullFaceMode = opts.cullFaceMode || "back";
  const blend = opts.blend || false;

  // Create shader modules
  const vertexModule = device.createShaderModule({ code: vert });
  const fragmentModule = device.createShaderModule({ code: frag });

  // Build vertex buffer layouts from vertexLayout
  const vertexBuffers = [];
  const sortedAttrs = Object.entries(vertexLayout).sort(
    (a, b) => (a[1].location || 0) - (b[1].location || 0),
  );

  for (const [name, attr] of sortedAttrs) {
    const location = attr.location ?? vertexBuffers.length;
    const attrFormat = attr.format || getFormatFromType(attr.type);
    const stride = attr.stride || getStrideFromFormat(attrFormat);

    vertexBuffers.push({
      arrayStride: stride,
      attributes: [
        {
          shaderLocation: location,
          offset: 0,
          format: attrFormat,
        },
      ],
    });
  }

  // If no layout specified, use default for position + normal
  if (vertexBuffers.length === 0) {
    vertexBuffers.push(
      {
        arrayStride: 12,
        attributes: [{ shaderLocation: 0, offset: 0, format: "float32x3" }],
      },
      {
        arrayStride: 12,
        attributes: [{ shaderLocation: 1, offset: 0, format: "float32x3" }],
      },
    );
  }

  // Create bind group layout if uniforms are expected
  let bindGroupLayout = null;
  if (opts.bindGroupLayout) {
    bindGroupLayout = device.createBindGroupLayout({
      entries: opts.bindGroupLayout,
    });
  }

  // Pipeline descriptor
  const pipelineDescriptor = {
    layout: bindGroupLayout
      ? device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] })
      : "auto",
    vertex: {
      module: vertexModule,
      entryPoint: opts.vertexEntryPoint || "vs_main",
      buffers: vertexBuffers,
    },
    fragment: {
      module: fragmentModule,
      entryPoint: opts.fragmentEntryPoint || "fs_main",
      targets: [{ format: opts.colorFormat || format }],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: cullFace ? cullFaceMode : "none",
    },
  };

  // Add depth stencil if depth test enabled
  if (depthTest) {
    pipelineDescriptor.depthStencil = {
      format: opts.depthFormat || "depth24plus",
      depthWriteEnabled: depthWrite,
      depthCompare: "less",
    };
  }

  // Add blend state if enabled
  if (blend) {
    pipelineDescriptor.fragment.targets[0].blend = {
      color: {
        srcFactor: "src-alpha",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
      alpha: {
        srcFactor: "one",
        dstFactor: "one-minus-src-alpha",
        operation: "add",
      },
    };
  }

  const gpuPipeline = device.createRenderPipeline(pipelineDescriptor);

  // Get auto-generated bind group layout
  let autoBindGroupLayout = null;
  try {
    autoBindGroupLayout = gpuPipeline.getBindGroupLayout(0);
  } catch (e) {
    // No bind group in shader
  }

  const pipeline = {
    class: "pipeline",
    gpuPipeline,
    bindGroupLayout: bindGroupLayout || autoBindGroupLayout,
    vertexModule,
    fragmentModule,

    _dispose() {
      // Pipelines don't need explicit disposal in WebGPU
    },
  };

  return pipeline;
}

/**
 * Get WebGPU format from type name
 */
function getFormatFromType(type) {
  const formats = {
    vec2: "float32x2",
    vec3: "float32x3",
    vec4: "float32x4",
    float: "float32",
  };
  return formats[type] || "float32x3";
}

/**
 * Get stride from format
 */
function getStrideFromFormat(format) {
  const strides = {
    float32: 4,
    float32x2: 8,
    float32x3: 12,
    float32x4: 16,
  };
  return strides[format] || 12;
}
