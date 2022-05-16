import assert from "assert";

import createGL from "pex-gl";

import createTexture from "./texture.js";
import createFramebuffer from "./framebuffer.js";
import createRenderbuffer from "./renderbuffer.js";
import createPass from "./pass.js";
import createPipeline from "./pipeline.js";
import createProgram from "./program.js";
import createBuffer from "./buffer.js";
import createQuery from "./query.js";

import {
  checkProps,
  enableNamespace,
  isWebGL2,
  log,
  NAMESPACE,
} from "./utils.js";

let ID = 0;

const allowedCommandProps = [
  "name",
  "pass",
  "pipeline",
  "uniforms",
  "attributes",
  "indices",
  "count",
  "instances",
  "viewport",
  "scissor",
];

/**
 * @typedef PexContext
 */

/**
 * @typedef PexContextOptions
 * @param {RenderingContext} [gl]
 * @param {number} [width]
 * @param {number} [height]
 * @param {number} [pixelRatio=1]
 * @param {"webgl" | "webgl2"} [type="webgl2"]
 * @param {boolean} [debug=false]
 */

/**
 * Create a rendering context
 * @param {PexContextOptions & import("pex-gl").Options} [options]
 * @returns {PexContext}
 */
function createContext(options = {}) {
  const opts = {
    pixelRatio: 1,
    type: "webgl2",
    ...options,
  };

  if (options.pixelRatio) {
    opts.pixelRatio = Math.min(opts.pixelRatio, window.devicePixelRatio);
  }

  const gl = opts.gl || createGL(opts);
  assert(gl, "pex-context: createContext failed");

  const capabilities = {
    isWebGL2: isWebGL2(gl),
    maxColorAttachments: 1,
    maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
    maxVertexTextureImageUnits: gl.getParameter(
      gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
    ),
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
    instancedArrays: false,
    instancing: false, // TODO: deprecate
    elementIndexUint32: !!gl.getExtension("OES_element_index_uint"),
    standardDerivatives: !!gl.getExtension("OES_standard_derivatives"),
    depthTexture: !!gl.getExtension("WEBGL_depth_texture"),
    shaderTextureLod: !!gl.getExtension("EXT_shader_texture_lod"),
    textureFloat: !!gl.getExtension("OES_texture_float"),
    textureFloatLinear: !!gl.getExtension("OES_texture_float_linear"),
    textureHalfFloat: !!gl.getExtension("OES_texture_half_float"),
    textureHalfFloatLinear: !!gl.getExtension("OES_texture_half_float_linear"),
    textureFilterAnisotropic: !!gl.getExtension(
      "EXT_texture_filter_anisotropic"
    ),
    disjointTimerQuery: !!(
      gl.getExtension("EXT_disjoint_timer_query_webgl2") ||
      gl.getExtension("EXT_disjoint_timer_query")
    ),
  };

  if (!gl.HALF_FLOAT) {
    const ext = gl.getExtension("OES_texture_half_float");
    if (ext) gl.HALF_FLOAT = ext.HALF_FLOAT_OES;
  }

  if (!capabilities.disjointTimerQuery) {
    gl.TIME_ELAPSED ||= "TIME_ELAPSED";
    gl.GPU_DISJOINT ||= "GPU_DISJOINT";
    gl.QUERY_RESULT ||= "QUERY_RESULT";
    gl.QUERY_RESULT_AVAILABLE ||= "QUERY_RESULT_AVAILABLE";
    gl.createQuery ||= () => ({});
    gl.deleteQuery ||= () => {};
    gl.beginQuery ||= () => {};
    gl.endQuery ||= () => {};
    gl.getQueryParameter = (q, param) => {
      if (param === gl.QUERY_RESULT_AVAILABLE) return true;
      if (param === gl.QUERY_RESULT) return 0;
      return undefined;
    };
    gl.getQueryObject = gl.getQueryParameter;
  } else {
    const extDTQ = capabilities.isWebGL2
      ? gl.getExtension("EXT_disjoint_timer_query_webgl2")
      : gl.getExtension("EXT_disjoint_timer_query");
    gl.TIME_ELAPSED = extDTQ.TIME_ELAPSED_EXT;
    gl.GPU_DISJOINT = extDTQ.GPU_DISJOINT_EXT;
    gl.QUERY_RESULT ||= extDTQ.QUERY_RESULT_EXT;
    gl.QUERY_RESULT_AVAILABLE ||= extDTQ.QUERY_RESULT_AVAILABLE_EXT;
    gl.createQuery ||= extDTQ.createQueryEXT.bind(extDTQ);
    gl.deleteQuery ||= extDTQ.deleteQueryEXT.bind(extDTQ);
    gl.beginQuery ||= extDTQ.beginQueryEXT.bind(extDTQ);
    gl.endQuery ||= extDTQ.endQueryEXT.bind(extDTQ);
    gl.getQueryParameter ||= extDTQ.getQueryObjectEXT.bind(extDTQ);
  }

  const BlendFactor = {
    One: gl.ONE,
    Zero: gl.ZERO,
    SrcAlpha: gl.SRC_ALPHA,
    OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA,
    DstAlpha: gl.DST_ALPHA,
    OneMinusDstAlpha: gl.ONE_MINUS_DST_ALPHA,
    SrcColor: gl.SRC_COLOR,
    OneMinusSrcColor: gl.ONE_MINUS_SRC_COLOR,
    DstColor: gl.DST_COLOR,
    OneMinusDstColor: gl.ONE_MINUS_DST_COLOR,
  };

  const CubemapFace = {
    PositiveX: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    NegativeX: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    PositiveY: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    NegativeY: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    PositiveZ: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    NegativeZ: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  };

  const DepthFunc = {
    Never: gl.NEVER,
    Less: gl.LESS,
    Equal: gl.EQUAL,
    LessEqual: gl.LEQUAL,
    Greater: gl.GREATER,
    NotEqual: gl.NOTEQUAL,
    GreaterEqual: gl.GEQUAL,
    Always: gl.ALWAYS,
  };

  const DataType = {
    Float16: gl.HALF_FLOAT,
    Float32: gl.FLOAT,
    Int8: gl.BYTE,
    Int16: gl.SHORT,
    Int32: gl.INT,
    Uint8: gl.UNSIGNED_BYTE,
    Uint16: gl.UNSIGNED_SHORT,
    Uint32: gl.UNSIGNED_INT,
  };

  const DataTypeConstructor = {
    [DataType.Float16]: Float32Array,
    [DataType.Float32]: Float32Array,
    [DataType.Int8]: Int8Array,
    [DataType.Int16]: Int16Array,
    [DataType.Int32]: Int32Array,
    [DataType.Uint8]: Uint8Array,
    [DataType.Uint16]: Uint16Array,
    [DataType.Uint32]: Uint32Array,
  };

  const Face = {
    Front: gl.FRONT,
    Back: gl.BACK,
    FrontAndBack: gl.FRONT_AND_BACK,
  };

  const Filter = {
    Nearest: gl.NEAREST,
    Linear: gl.LINEAR,
    NearestMipmapNearest: gl.NEAREST_MIPMAP_NEAREST,
    NearestMipmapLinear: gl.NEAREST_MIPMAP_LINEAR,
    LinearMipmapNearest: gl.LINEAR_MIPMAP_NEAREST,
    LinearMipmapLinear: gl.LINEAR_MIPMAP_LINEAR,
  };

  // Mapping of format and type (with alternative types)
  const TextureFormat = {
    // Unsized Internal Formats
    RGB: [gl.RGB, DataType.Uint8], // gl.UNSIGNED_SHORT_5_6_5
    RGBA: [gl.RGBA, DataType.Uint8], // gl.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_5_5_5_1
    LUMINANCE_ALPHA: [gl.LUMINANCE_ALPHA, DataType.Uint8],
    LUMINANCE: [gl.LUMINANCE, DataType.Uint8],
    ALPHA: [gl.ALPHA, DataType.Uint8],

    // Sized internal formats
    R8: [gl.RED, DataType.Uint8],
    R8_SNORM: [gl.RED, DataType.Int8],
    R16F: [gl.RED, DataType.Float16], // DataType.Float32
    R32F: [gl.RED, DataType.Float32],

    R8UI: [gl.RED_INTEGER, DataType.Uint8],
    R8I: [gl.RED_INTEGER, DataType.Int8],
    R16UI: [gl.RED_INTEGER, DataType.Uint16],
    R16I: [gl.RED_INTEGER, DataType.Int16],
    R32UI: [gl.RED_INTEGER, DataType.Uint32],
    R32I: [gl.RED_INTEGER, DataType.Int32],

    RG8: [gl.RG, DataType.Uint8],
    RG8_SNORM: [gl.RG, DataType.Int8],
    RG16F: [gl.RG, DataType.Float16], // DataType.Float32
    RG32F: [gl.RG, DataType.Float32],

    RG8UI: [gl.RG_INTEGER, DataType.Uint8],
    RG8I: [gl.RG_INTEGER, DataType.Int8],
    RG16UI: [gl.RG_INTEGER, DataType.Uint16],
    RG16I: [gl.RG_INTEGER, DataType.Int16],
    RG32UI: [gl.RG_INTEGER, DataType.Uint32],
    RG32I: [gl.RG_INTEGER, DataType.Int32],

    RGB8: [gl.RGB, DataType.Uint8],
    SRGB8: [gl.RGB, DataType.Uint8],
    RGB565: [gl.RGB, gl.UNSIGNED_SHORT_5_6_5], // DataType.Uint8
    RGB8_SNORM: [gl.RGB, DataType.Int8],
    R11F_G11F_B10F: [gl.RGB, gl.UNSIGNED_INT_10F_11F_11F_REV], // DataType.Float16, DataType.Float32
    RGB9_E5: [gl.RGB, gl.UNSIGNED_INT_5_9_9_9_REV], // DataType.Float16, DataType.Float32
    RGB16F: [gl.RGB, DataType.Float16], // DataType.Float32
    RGB32F: [gl.RGB, DataType.Float32],

    RGB8UI: [gl.RGB_INTEGER, DataType.Uint8],
    RGB8I: [gl.RGB_INTEGER, DataType.Int8],
    RGB16UI: [gl.RGB_INTEGER, DataType.Uint16],
    RGB16I: [gl.RGB_INTEGER, DataType.Int16],
    RGB32UI: [gl.RGB_INTEGER, DataType.Uint32],
    RGB32I: [gl.RGB_INTEGER, DataType.Int32],

    RGBA8: [gl.RGBA, DataType.Uint8],
    SRGB8_ALPHA8: [gl.RGBA, DataType.Uint8],
    RGBA8_SNORM: [gl.RGBA, DataType.Int8],
    RGB5_A1: [gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1], // DataType.Uint8, gl.UNSIGNED_INT_2_10_10_10_REV
    RGBA4: [gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4], // DataType.Uint8
    RGB10_A2: [gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV],
    RGBA16F: [gl.RGBA, DataType.Float16], // DataType.Float32
    RGBA32F: [gl.RGBA, DataType.Float32],

    RGBA8UI: [gl.RGBA_INTEGER, DataType.Uint8],
    RGBA8I: [gl.RGBA_INTEGER, DataType.Int8],
    RGB10_A2UI: [gl.RGBA_INTEGER, gl.UNSIGNED_INT_2_10_10_10_REV],
    RGBA16UI: [gl.RGBA_INTEGER, DataType.Uint16],
    RGBA16I: [gl.RGBA_INTEGER, DataType.Int16],
    RGBA32I: [gl.RGBA_INTEGER, DataType.Int32],
    RGBA32UI: [gl.RGBA_INTEGER, DataType.Uint32],

    // Depth and stencil
    DEPTH_COMPONENT16: [gl.DEPTH_COMPONENT, DataType.Uint16], // DataType.Uint32
    DEPTH_COMPONENT24: [gl.DEPTH_COMPONENT, DataType.Uint32],
    DEPTH_COMPONENT32F: [gl.DEPTH_COMPONENT, DataType.Float32],
    DEPTH24_STENCIL8: [gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8],
    DEPTH32F_STENCIL8: [gl.DEPTH_STENCIL, gl.FLOAT_32_UNSIGNED_INT_24_8_REV],
  };
  if (gl instanceof WebGLRenderingContext) {
    if (capabilities.depthTexture) {
      TextureFormat.DEPTH_COMPONENT = [gl.DEPTH_COMPONENT, DataType.Uint16];
      TextureFormat.DEPTH_STENCIL = [gl.DEPTH_STENCIL, DataType.Uint16];
    }
    TextureFormat.R16FLegacy = [gl.ALPHA, DataType.Float16];
    TextureFormat.R32FLegacy = [gl.ALPHA, DataType.Float32];
  }
  const PixelFormat = {
    ...Object.fromEntries(
      Object.keys(TextureFormat).map((internalFormat) => [
        internalFormat,
        internalFormat,
      ])
    ),
    // Legacy
    Depth: "DEPTH_COMPONENT",
    Depth16: "DEPTH_COMPONENT16",
    Depth24: "DEPTH_COMPONENT24",
  };

  const Encoding = {
    Linear: 1,
    Gamma: 2,
    SRGB: 3,
    RGBM: 4,
  };

  const Primitive = {
    Points: gl.POINTS,
    Lines: gl.LINES,
    LineStrip: gl.LINE_STRIP,
    Triangles: gl.TRIANGLES,
    TriangleStrip: gl.TRIANGLE_STRIP,
  };

  const Usage = {
    StaticDraw: gl.STATIC_DRAW,
    DynamicDraw: gl.DYNAMIC_DRAW,
    StreamDraw: gl.STREAM_DRAW,
  };

  const Wrap = {
    ClampToEdge: gl.CLAMP_TO_EDGE,
    Repeat: gl.REPEAT,
  };

  const QueryTarget = {
    TimeElapsed: gl.TIME_ELAPSED,
    // webgl2
    AnySamplesPassed: gl.ANY_SAMPLES_PASSED,
    AnySamplesPassedConservative: gl.ANY_SAMPLES_PASSED_CONSERVATIVE,
    TransformFeedbackPrimitivesWritten:
      gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN,
  };

  const QueryState = {
    Ready: "ready",
    Active: "active",
    Pending: "pending",
  };

  const ctx = {
    gl,
    get width() {
      return gl.drawingBufferWidth;
    },
    get height() {
      return gl.drawingBufferHeight;
    },
    BlendFactor,
    CubemapFace,
    DataType,
    DataTypeConstructor,
    DepthFunc,
    Face,
    Filter,
    TextureFormat,
    PixelFormat,
    Encoding,
    Primitive,
    Usage,
    Wrap,
    QueryTarget,
    QueryState,
  };

  const defaultState = {
    pass: {
      framebuffer: {
        id: `framebuffer_${ID++}`,
        target: gl.FRAMEBUFFER,
        handle: null,
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
      },
      clearColor: [0, 0, 0, 1],
      clearDepth: 1,
    },
    pipeline: createPipeline(ctx, {}),
    viewport: [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight],
    scissor: null,
    count: 0,
  };

  // extensions
  if (!gl.drawElementsInstanced) {
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) {
      // TODO: this._caps[CAPS_INSTANCED_ARRAYS] = false;
      gl.drawElementsInstanced = () => {
        throw new Error(
          "gl.drawElementsInstanced not available. ANGLE_instanced_arrays not supported"
        );
      };
      gl.drawArraysInstanced = () => {
        throw new Error(
          "gl.drawArraysInstanced not available. ANGLE_instanced_arrays not supported"
        );
      };
      gl.vertexAttribDivisor = () => {
        throw new Error(
          "gl.vertexAttribDivisor not available. ANGLE_instanced_arrays not supported"
        );
      };
    } else {
      // TODO: this._caps[CAPS_INSTANCED_ARRAYS] = true;
      gl.drawElementsInstanced = ext.drawElementsInstancedANGLE.bind(ext);
      gl.drawArraysInstanced = ext.drawArraysInstancedANGLE.bind(ext);
      gl.vertexAttribDivisor = ext.vertexAttribDivisorANGLE.bind(ext);
      capabilities.instancedArrays = true;
      capabilities.instancing = true; // TODO: deprecate
    }
  } else {
    capabilities.instancedArrays = true;
    capabilities.instancing = true; // TODO: deprecate
  }

  if (!gl.drawBuffers) {
    const ext = gl.getExtension("WEBGL_draw_buffers");
    if (!ext) {
      gl.drawBuffers = () => {
        throw new Error("WEBGL_draw_buffers not supported");
      };
    } else {
      gl.drawBuffers = ext.drawBuffersWEBGL.bind(ext);
      capabilities.maxColorAttachments = gl.getParameter(
        ext.MAX_COLOR_ATTACHMENTS_WEBGL
      );
    }
  } else {
    capabilities.maxColorAttachments = gl.getParameter(
      gl.MAX_COLOR_ATTACHMENTS
    );
  }

  function compareFBOAttachments(framebuffer, passOpts) {
    const fboDepthAttachment = framebuffer.depth?.texture;
    const passDepthAttachment = passOpts.depth?.texture || passOpts.depth;
    if (fboDepthAttachment != passDepthAttachment) return false;
    if (framebuffer.color.length != passOpts.color.length) return false;

    for (let i = 0; i < framebuffer.color.length; i++) {
      const fboColorAttachment = framebuffer.color[i]?.texture;
      const passColorAttachment =
        passOpts.color[i]?.texture || passOpts.color[i];
      if (fboColorAttachment != passColorAttachment) return false;
    }

    return true;
  }

  Object.assign(ctx, {
    debugMode: false,
    capabilities,
    // debugGraph: '',
    debugCommands: [],
    resources: [],
    stats: {},
    queries: [],
    stack: [defaultState],
    defaultState,
    pixelRatio: opts.pixelRatio,
    state: {
      framebuffer: defaultState.pass.framebuffer,
      pipeline: createPipeline(ctx, {}),
      activeTextures: [],
      activeAttributes: [],
    },
    getGLString(glEnum) {
      let str = "";
      for (let key in gl) {
        if (gl[key] === glEnum) str = key;
      }
      if (!str) {
        str = "UNDEFINED";
      }
      return str;
    },
    set({ pixelRatio, width, height }) {
      if (pixelRatio) {
        this.updatePixelRatio = Math.min(pixelRatio, window.devicePixelRatio);
      }

      if (width) {
        this.updateWidth = width;
      }

      if (height) {
        this.updateHeight = height;
      }
    },
    debug(enabled) {
      this.debugMode = enabled;
      if (enabled) {
        this.debugCommands = [];
        if (!log.enabled) {
          enableNamespace(NAMESPACE);
          log("capabilities", capabilities);
        }
      }
    },
    checkError() {
      if (this.debugMode) {
        const error = gl.getError();
        if (error) {
          this.debugMode = false; // prevents rolling errors
          log("State", this.state.state);
          throw new Error(`GL error ${error} : ${this.getGLString(error)}`);
        }
      }
    },
    resource(res) {
      res.id = `${res.class}_${ID++}`;
      if (!this.stats[res.class]) {
        this.stats[res.class] = { alive: 0, total: 0 };
      }
      this.stats[res.class].alive++;
      this.stats[res.class].total++;
      this.resources.push(res);
      this.checkError();
      return res;
    },
    // texture2D({ data: TypedArray, width: Int, height: Int, format: PixelFormat, flipY: Boolean })
    texture2D(opts) {
      log("texture2D", opts);
      opts.target = gl.TEXTURE_2D;
      return this.resource(createTexture(this, opts));
    },
    // textureCube({ data: [negxData, negyData,...], width: Int, height: Int, format: PixelFormat, flipY: Boolean })
    textureCube(opts) {
      log("textureCube", opts);
      opts.target = gl.TEXTURE_CUBE_MAP;
      return this.resource(createTexture(this, opts));
    },
    // framebuffer({ color: [ Texture2D, .. ], depth: Texture2D }
    // framebuffer({ color: [ { texture: Texture2D, target: Enum, level: int }, .. ], depth: { texture: Texture2D }})
    framebuffer(opts) {
      log("framebuffer", opts);
      return this.resource(createFramebuffer(this, opts));
    },
    // renderbuffer({ width: int, height: int })
    renderbuffer(opts) {
      log("renderbuffer", opts);
      return this.resource(createRenderbuffer(this, opts));
    },
    // TODO: Should we have named versions or generic 'ctx.buffer' command?
    // In regl buffer() is ARRAY_BUFFER (aka VertexBuffer) and elements() is ELEMENT_ARRAY_BUFFER
    // Now in WebGL2 we get more types Uniform, TransformFeedback, Copy
    // Possible options: {
    //    data: Array or ArrayBuffer
    //    type: 'float', 'uint16' etc
    // }
    vertexBuffer(opts) {
      log("vertexBuffer", opts);
      if (opts.length) {
        opts = { data: opts };
      }
      opts.target = gl.ARRAY_BUFFER;
      return this.resource(createBuffer(this, opts));
    },
    indexBuffer(opts) {
      log("indexBuffer", opts);
      if (opts.length) {
        opts = { data: opts };
      }
      opts.target = gl.ELEMENT_ARRAY_BUFFER;
      return this.resource(createBuffer(this, opts));
    },
    program(opts) {
      log("program", opts);
      return this.resource(createProgram(this, opts));
    },
    pipeline(opts) {
      log("pipeline", opts);
      return this.resource(createPipeline(this, opts));
    },
    pass(opts) {
      log(
        "pass",
        opts,
        opts.color
          ? opts.color.map(({ texture, info }) =>
              texture ? texture.info : info
            )
          : ""
      );
      return this.resource(createPass(this, opts));
    },
    query(opts) {
      log("query", opts);
      return this.resource(createQuery(this, opts));
    },
    beginQuery(q) {
      assert(!this.activeQuery, "Only one query can be active at the time");
      if (q._begin(this, q)) {
        this.activeQuery = q;
      }
    },
    endQuery(q) {
      if (q._end(this, q)) {
        this.queries.push(q);
        this.activeQuery = null;
      }
    },
    readPixels(opts) {
      const x = opts.x || 0;
      const y = opts.y || 0;
      const width = opts.width;
      const height = opts.height;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      let pixels = null;
      pixels = new Uint8Array(width * height * 4);
      gl.readPixels(x, y, width, height, format, type, pixels);
      return pixels;
    },
    // update(texture, { data: TypeArray, [width: Int, height: Int] })
    // update(texture, { data: TypedArray })
    update(resource, opts) {
      if (this.debugMode) log("update", { resource, opts });
      resource._update(this, resource, opts);
    },
    // TODO: i don't like this inherit flag
    mergeCommands(parent, cmd, inherit) {
      // copy old state so we don't modify it's internals
      const newCmd = Object.assign({}, parent);

      if (!inherit) {
        // clear values are not merged as they are applied only in the parent command
        newCmd.pass = Object.assign({}, parent.pass);
        newCmd.pass.clearColor = undefined;
        newCmd.pass.clearDepth = undefined;
      }

      // overwrite properties from new command
      Object.assign(newCmd, cmd);

      // set viewport to FBO sizes when rendering to a texture
      if (!cmd.viewport && cmd.pass && cmd.pass.opts.color) {
        let tex = null;
        if (cmd.pass.opts.color[0]) {
          tex = cmd.pass.opts.color[0].texture || cmd.pass.opts.color[0];
        }
        if (cmd.pass.opts.depth) {
          tex = cmd.pass.opts.depth.texture || cmd.pass.opts.depth;
        }
        if (tex) {
          newCmd.viewport = [0, 0, tex.width, tex.height];
        }
      }

      // merge uniforms
      newCmd.uniforms =
        parent.uniforms || cmd.uniforms
          ? Object.assign({}, parent.uniforms, cmd.uniforms)
          : null;
      return newCmd;
    },
    applyPass(pass) {
      const gl = this.gl;
      const state = this.state;

      // Need to find reliable way of deciding if i should update framebuffer
      // 1. If pass has fbo, bind it
      // 3. Else if there is another framebuffer on stack (currently bound) leave it
      // 3. Else if there is only screen framebuffer on the stack and currently bound fbo is different, change it
      // 4. TODO: If there is pass with fbo and another fbo on stack throw error (no interleaved passes are allowed)
      if (pass.framebuffer) {
        let framebuffer = pass.framebuffer;
        if (framebuffer.id !== state.framebuffer.id) {
          if (this.debugMode) {
            log("change framebuffer", state.framebuffer, "->", framebuffer);
          }
          if (
            framebuffer._update &&
            !compareFBOAttachments(framebuffer, pass.opts)
          ) {
            this.update(pass.framebuffer, pass.opts);
          }
          ctx.state.framebuffer = framebuffer;
          gl.bindFramebuffer(framebuffer.target, framebuffer.handle);
          if (framebuffer.drawBuffers && framebuffer.drawBuffers.length > 1) {
            gl.drawBuffers(framebuffer.drawBuffers);
          }
        }
      } else {
        // inherit framebuffer from parent command
        // if pass doesn't specify color or depth attachments
        // and therefore doesn't have own framebuffer assigned
        let framebuffer;
        let i = ctx.stack.length - 1;
        while (!framebuffer && i >= 0) {
          if (ctx.stack[i].pass) {
            framebuffer = ctx.stack[i].pass.framebuffer;
          }
          --i;
        }
        if (
          framebuffer == ctx.defaultState.pass.framebuffer &&
          ctx.state.framebuffer !== framebuffer
        ) {
          ctx.state.framebuffer = framebuffer;
          gl.bindFramebuffer(framebuffer.target, framebuffer.handle);
        }
      }

      let clearBits = 0;
      if (pass.clearColor !== undefined) {
        if (this.debugMode) log("clearing color", pass.clearColor);
        clearBits |= gl.COLOR_BUFFER_BIT;
        // TODO this might be unnecesary but we don't know because we don't store the clearColor in state
        gl.clearColor(
          pass.clearColor[0],
          pass.clearColor[1],
          pass.clearColor[2],
          pass.clearColor[3]
        );
      }

      if (pass.clearDepth !== undefined) {
        if (this.debugMode) log("clearing depth", pass.clearDepth);
        clearBits |= gl.DEPTH_BUFFER_BIT;

        if (!state.depthWrite) {
          state.depthWrite = true;
          gl.depthMask(true);
        }
        // TODO this might be unnecesary but we don't know because we don't store the clearDepth in state
        gl.clearDepth(pass.clearDepth);
      }

      if (clearBits) {
        gl.clear(clearBits);
      }
      this.checkError();
    },
    applyPipeline(pipeline) {
      const gl = this.gl;
      const state = this.state;

      if (pipeline.depthWrite !== state.depthWrite) {
        state.depthWrite = pipeline.depthWrite;
        gl.depthMask(state.depthWrite);
      }

      if (pipeline.depthTest !== state.depthTest) {
        state.depthTest = pipeline.depthTest;
        state.depthTest ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);
      }

      if (pipeline.depthFunc !== state.depthFunc) {
        state.depthFunc = pipeline.depthFunc;
        gl.depthFunc(state.depthFunc);
      }

      if (
        pipeline.blend !== state.blend ||
        pipeline.blendSrcRGBFactor !== state.blendSrcRGBFactor ||
        pipeline.blendSrcAlphaFactor !== state.blendSrcAlphaFactor ||
        pipeline.blendDstRGBFactor !== state.blendDstRGBFactor ||
        pipeline.blendDstAlphaFactor !== state.blendDstAlphaFactor
      ) {
        state.blend = pipeline.blend;
        state.blendSrcRGBFactor = pipeline.blendSrcRGBFactor;
        state.blendSrcAlphaFactor = pipeline.blendSrcAlphaFactor;
        state.blendDstRGBFactor = pipeline.blendDstRGBFactor;
        state.blendDstAlphaFactor = pipeline.blendDstAlphaFactor;
        state.blend ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND);
        gl.blendFuncSeparate(
          state.blendSrcRGBFactor,
          state.blendDstRGBFactor,
          state.blendSrcAlphaFactor,
          state.blendDstAlphaFactor
        );
      }

      if (
        pipeline.cullFace !== state.cullFace ||
        pipeline.cullFaceMode !== state.cullFaceMode
      ) {
        state.cullFace = pipeline.cullFace;
        state.cullFaceMode = pipeline.cullFaceMode;
        state.cullFace ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE);
        if (state.cullFace) {
          gl.cullFace(state.cullFaceMode);
        }
      }
      if (
        pipeline.colorMask[0] !== state.pipeline.colorMask[0] ||
        pipeline.colorMask[1] !== state.pipeline.colorMask[1] ||
        pipeline.colorMask[2] !== state.pipeline.colorMask[2] ||
        pipeline.colorMask[3] !== state.pipeline.colorMask[3]
      ) {
        state.pipeline.colorMask[0] = pipeline.colorMask[0];
        state.pipeline.colorMask[1] = pipeline.colorMask[1];
        state.pipeline.colorMask[2] = pipeline.colorMask[2];
        state.pipeline.colorMask[3] = pipeline.colorMask[3];
        gl.colorMask(
          pipeline.colorMask[0],
          pipeline.colorMask[1],
          pipeline.colorMask[2],
          pipeline.colorMask[3]
        );
      }

      if (pipeline.program !== state.program) {
        state.program = pipeline.program;
        if (state.program) {
          gl.useProgram(state.program.handle);
        }
      }

      if (pipeline.vertexLayout) {
        state.vertexLayout = pipeline.vertexLayout;
      }
      this.checkError();
    },
    applyUniforms(uniforms, cmd) {
      const gl = this.gl;
      const state = this.state;
      let numTextures = 0;

      if (!state.program) {
        assert.fail("Trying to draw without an active program");
      }

      const requiredUniforms = this.debugMode
        ? Object.keys(state.program.uniforms)
        : null;

      for (const name in uniforms) {
        let value = uniforms[name];
        // TODO: find a better way to not trying to set unused uniforms that might have been inherited
        if (
          !state.program.uniforms[name] &&
          !state.program.uniforms[`${name}[0]`]
        ) {
          continue;
        }
        if (value === null || value === undefined) {
          log("invalid command", cmd);
          assert.fail(`Can't set uniform "${name}" with a null value`);
        }
        // FIXME: uniform array hack
        if (Array.isArray(value) && !state.program.uniforms[name]) {
          if (this.debugMode) {
            log("unknown uniform", name, Object.keys(state.program.uniforms));
          }
          for (let i = 0; i < value.length; i++) {
            const nameIndex = `${name}[${i}]`;
            state.program.setUniform(nameIndex, value[i]);
            if (this.debugMode) {
              requiredUniforms.splice(requiredUniforms.indexOf(nameIndex), 1);
            }
          }
        } else if (value.target) {
          // assuming texture
          // FIXME: texture binding hack
          const slot = numTextures++;
          gl.activeTexture(gl.TEXTURE0 + slot);
          if (state.activeTextures[slot] !== value) {
            gl.bindTexture(value.target, value.handle);
            state.activeTextures[slot] = value;
          }
          state.program.setUniform(name, slot);
          if (this.debugMode) {
            requiredUniforms.splice(requiredUniforms.indexOf(name), 1);
          }
        } else if (!value.length && typeof value === "object") {
          log("invalid command", cmd);
          assert.fail(`Can set uniform "${name}" with an Object value`);
        } else {
          state.program.setUniform(name, value);
          if (this.debugMode) {
            requiredUniforms.splice(requiredUniforms.indexOf(name), 1);
          }
        }
      }
      if (this.debugMode && requiredUniforms.length > 0) {
        log("invalid command", cmd);
        assert.fail(
          `Trying to draw with missing uniforms: ${requiredUniforms.join(", ")}`
        );
      }
      this.checkError();
    },
    drawVertexData(cmd) {
      const state = this.state;
      const vertexLayout = state.vertexLayout;

      if (!state.program) {
        assert.fail("Trying to draw without an active program");
      }

      if (this.debugMode) {
        // TODO: can vertex layout be ever different if it's derived from pipeline's shader?
        if (
          vertexLayout.length !== Object.keys(state.program.attributes).length
        ) {
          log(
            "Invalid vertex layout not matching the shader",
            vertexLayout,
            state.program.attributes,
            cmd
          );
          assert.fail("Invalid vertex layout not matching the shader");
        }
      }

      let instanced = false;
      // TODO: disable unused vertex array slots
      for (let i = 0; i < 16; i++) {
        state.activeAttributes[i] = null;
        gl.disableVertexAttribArray(i);
      }

      // TODO: the same as i support [tex] and { texture: tex } i should support buffers in attributes?
      vertexLayout.forEach((layout, i) => {
        const name = layout[0];
        const location = layout[1];
        const size = layout[2];
        const attrib = cmd.attributes[i] || cmd.attributes[name];

        if (!attrib) {
          log(
            "Invalid command",
            cmd,
            "doesn't satisfy vertex layout",
            vertexLayout
          );
          assert.fail(
            `Command is missing attribute "${name}" at location ${location} with ${attrib}`
          );
        }

        let buffer = attrib.buffer;
        if (!buffer && attrib.class === "vertexBuffer") {
          buffer = attrib;
        }

        if (!buffer || !buffer.target) {
          log("Invalid command", cmd);
          assert.fail(
            `Trying to draw arrays with invalid buffer for attribute : ${name}`
          );
        }

        gl.bindBuffer(buffer.target, buffer.handle);
        if (size === 16) {
          gl.enableVertexAttribArray(location + 0);
          gl.enableVertexAttribArray(location + 1);
          gl.enableVertexAttribArray(location + 2);
          gl.enableVertexAttribArray(location + 3);
          state.activeAttributes[location + 0] = buffer;
          state.activeAttributes[location + 1] = buffer;
          state.activeAttributes[location + 2] = buffer;
          state.activeAttributes[location + 3] = buffer;
          // we still check for buffer type because while e.g. pex-renderer would copy buffer type to attrib
          // a raw pex-context example probably would not
          gl.vertexAttribPointer(
            location,
            4,
            attrib.type || buffer.type,
            attrib.normalized || false,
            attrib.stride || 64,
            attrib.offset || 0
          );
          gl.vertexAttribPointer(
            location + 1,
            4,
            attrib.type || buffer.type,
            attrib.normalized || false,
            attrib.stride || 64,
            attrib.offset || 16
          );
          gl.vertexAttribPointer(
            location + 2,
            4,
            attrib.type || buffer.type,
            attrib.normalized || false,
            attrib.stride || 64,
            attrib.offset || 32
          );
          gl.vertexAttribPointer(
            location + 3,
            4,
            attrib.type || buffer.type,
            attrib.normalized || false,
            attrib.stride || 64,
            attrib.offset || 48
          );
          if (attrib.divisor) {
            gl.vertexAttribDivisor(location + 0, attrib.divisor);
            gl.vertexAttribDivisor(location + 1, attrib.divisor);
            gl.vertexAttribDivisor(location + 2, attrib.divisor);
            gl.vertexAttribDivisor(location + 3, attrib.divisor);
            instanced = true;
          } else if (capabilities.instancing) {
            gl.vertexAttribDivisor(location + 0, 0);
            gl.vertexAttribDivisor(location + 1, 0);
            gl.vertexAttribDivisor(location + 2, 0);
            gl.vertexAttribDivisor(location + 3, 0);
          }
        } else {
          gl.enableVertexAttribArray(location);
          state.activeAttributes[location] = buffer;
          gl.vertexAttribPointer(
            location,
            size,
            attrib.type || buffer.type,
            attrib.normalized || false,
            attrib.stride || 0,
            attrib.offset || 0
          );
          if (attrib.divisor) {
            gl.vertexAttribDivisor(location, attrib.divisor);
            instanced = true;
          } else if (capabilities.instancing) {
            gl.vertexAttribDivisor(location, 0);
          }
        }
        // TODO: how to match index with vertexLayout location?
      });

      let primitive = cmd.pipeline.primitive;
      if (cmd.indices) {
        let indexBuffer = cmd.indices.buffer;
        if (!indexBuffer && cmd.indices.class === "indexBuffer") {
          indexBuffer = cmd.indices;
        }
        if (!indexBuffer || !indexBuffer.target) {
          log("Invalid command", cmd);
          assert.fail(`Trying to draw arrays with invalid buffer for elements`);
        }
        state.indexBuffer = indexBuffer;
        gl.bindBuffer(indexBuffer.target, indexBuffer.handle);
        const count = cmd.count || indexBuffer.length;
        const offset = cmd.indices.offset || 0;
        const type = cmd.indices.type || indexBuffer.type;
        if (instanced) {
          // TODO: check if instancing available
          gl.drawElementsInstanced(
            primitive,
            count,
            type,
            offset,
            cmd.instances
          );
        } else {
          gl.drawElements(primitive, count, type, offset);
        }
      } else if (cmd.count) {
        const first = 0;
        if (instanced) {
          gl.drawArraysInstanced(primitive, first, cmd.count, cmd.instances);
        } else {
          gl.drawArrays(primitive, first, cmd.count);
        }
      } else {
        assert.fail("Vertex arrays requres elements or count to draw");
      }
      this.checkError();
    },
    frame(cb) {
      requestAnimationFrame(
        function frame() {
          if (this.updatePixelRatio) {
            this.pixelRatio = this.updatePixelRatio;
            // we need to reaply width/height and update styles
            if (!this.updateWidth) {
              this.updateWidth =
                parseInt(gl.canvas.style.width) || gl.canvas.width;
            }
            if (!this.updateHeight) {
              this.updateHeight =
                parseInt(gl.canvas.style.height) || gl.canvas.height;
            }
            this.updatePixelRatio = 0;
          }
          if (this.updateWidth) {
            gl.canvas.style.width = `${this.updateWidth}px`;
            gl.canvas.width = this.updateWidth * this.pixelRatio;
            this.updateWidth = 0;
          }
          if (this.updateHeight) {
            gl.canvas.style.height = `${this.updateHeight}px`;
            gl.canvas.height = this.updateHeight * this.pixelRatio;
            this.updateHeight = 0;
          }
          if (
            this.defaultState.viewport[2] !== gl.drawingBufferWidth ||
            this.defaultState.viewport[3] !== gl.drawingBufferHeight
          ) {
            this.defaultState.viewport[2] = gl.drawingBufferWidth;
            this.defaultState.viewport[3] = gl.drawingBufferHeight;
            this.defaultState.pass.framebuffer.width = gl.drawingBufferWidth;
            this.defaultState.pass.framebuffer.height = gl.drawingBufferHeight;
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          }
          if (cb() === false) {
            // interrupt render loop
            return;
          }
          if (this.queries.length) {
            this.queries = this.queries.filter((q) => !q._available(this, q));
          }
          requestAnimationFrame(frame.bind(this));
        }.bind(this)
      );
    },
    // TODO: switching to lightweight resources would allow to just clone state
    // and use commands as state modifiers?
    apply(cmd) {
      const state = this.state;

      if (this.debugMode)
        log("apply", cmd.name || cmd.id, {
          cmd,
          state: JSON.parse(JSON.stringify(state)),
        });

      this.checkError();

      if (cmd.scissor) {
        if (cmd.scissor !== state.scissor) {
          state.scissor = cmd.scissor;
          gl.enable(gl.SCISSOR_TEST);
          gl.scissor(
            state.scissor[0],
            state.scissor[1],
            state.scissor[2],
            state.scissor[3]
          );
        }
      } else {
        if (cmd.scissor !== state.scissor) {
          state.scissor = cmd.scissor;
          gl.disable(gl.SCISSOR_TEST);
        }
      }

      if (cmd.pass) this.applyPass(cmd.pass);
      if (cmd.pipeline) this.applyPipeline(cmd.pipeline);
      if (cmd.uniforms) this.applyUniforms(cmd.uniforms);

      if (cmd.viewport) {
        if (cmd.viewport !== state.viewport) {
          state.viewport = cmd.viewport;
          gl.viewport(
            state.viewport[0],
            state.viewport[1],
            state.viewport[2],
            state.viewport[3]
          );
        }
      }

      if (cmd.attributes) {
        this.drawVertexData(cmd);
      }
    },
    submit(cmd, batches, subCommand) {
      const prevFramebufferId = this.state.framebuffer?.id;
      if (this.debugMode) {
        checkProps(allowedCommandProps, cmd);
        if (batches && subCommand) {
          log("submit", cmd.name || cmd.id, {
            depth: this.stack.length,
            cmd,
            batches,
            subCommand,
            state: this.state,
            stack: this.stack,
          });
        } else if (batches) {
          log("submit", cmd.name || cmd.id, {
            depth: this.stack.length,
            cmd,
            batches,
            state: this.state,
            stack: this.stack,
          });
        } else {
          log("submit", cmd.name || cmd.id, {
            depth: this.stack.length,
            cmd,
            state: this.state,
            stack: this.stack,
          });
        }
      }

      if (batches) {
        if (Array.isArray(batches)) {
          // TODO: quick hack
          for (const batch of batches) {
            this.submit(this.mergeCommands(cmd, batch, true), subCommand);
          }

          return;
        } else if (typeof batches === "object") {
          this.submit(this.mergeCommands(cmd, batches, true), subCommand);
          return;
        } else {
          subCommand = batches; // shift argument
        }
      }

      const parentState = this.stack[this.stack.length - 1];
      const cmdState = this.mergeCommands(parentState, cmd, false);
      this.apply(cmdState);

      const currFramebufferId = this.state.framebuffer?.id;
      if (this.debugMode) {
        const framebufferCanged = prevFramebufferId != currFramebufferId;
        log(
          "fbo-state",
          "  ".repeat(this.stack.length),
          cmd.name,
          framebufferCanged
            ? `${prevFramebufferId} -> ${currFramebufferId}`
            : currFramebufferId,
          [...this.state.viewport],
          this.state.scissor ? [...this.state.scissor] : "[]"
        );
      }

      if (this.debugMode) {
        cmdState.debugId = this.debugCommands.length;
        this.debugCommands.push({
          cmd,
          cmdState,
          parentState,
        });
      }
      if (subCommand) {
        if (this.debugMode) {
          this.debugGraph += `subgraph cluster_${cmd.name || cmd.id} {\n`;
          this.debugGraph += `label = "${cmd.name}"\n`;
          if (cmd.program) {
            this.debugGraph += `${cmd.program.id} -> cluster_${
              cmd.name || cmd.id
            }\n`;
          }
          if (cmd.framebuffer) {
            this.debugGraph += `${cmd.framebuffer.id} -> cluster_${
              cmd.name || cmd.id
            }\n`;
            for (let i = 0; i < cmd.framebuffer.color; i++) {
              const attachment = cmd.framebuffer.color[i];
              this.debugGraph += `${attachment.texture.id} -> ${cmd.framebuffer.id}\n`;
            }
            if (cmd.framebuffer.depth) {
              this.debugGraph += `${cmd.framebuffer.depth.texture.id} -> ${cmd.framebuffer.id}\n`;
            }
          }
        }
        this.stack.push(cmdState);
        subCommand();
        this.stack.pop();
        if (this.debugMode) {
          this.debugGraph += "}\n";
        }
      }
      this.checkError();
    },
    dispose(res) {
      log("dispose", res);
      assert(
        res || arguments.length === 0,
        "Trying to dispose undefined resource"
      );
      if (res) {
        if (!res._dispose) {
          assert(res._dispose, "Trying to dispose non resource");
        }
        const idx = this.resources.indexOf(res);
        assert(idx !== -1, "Trying to dispose resource from another context");
        this.resources.splice(idx, 1);
        this.stats[res.class].alive--;
        res._dispose();
      } else {
        while (this.resources.length) {
          this.dispose(this.resources[0]);
        }
        this.gl.canvas.width = 1;
        this.gl.canvas.height = 1;
      }
    },
  });

  if (opts.debug) ctx.debug(true);

  ctx.apply(defaultState);
  return ctx;
}

export default createContext;
