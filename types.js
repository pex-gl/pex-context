/**
 * @typedef {Object} PexContextOptions
 * @property {WebGLRenderingContext | WebGL2RenderingContext} [gl=WebGL2RenderingContext]
 * @property {number} [width=window.innerWidth]
 * @property {number} [height=window.innerHeight]
 * @property {number} [pixelRatio=1]
 * @property {"webgl" | "webgl2"} [type="webgl2"]
 * @property {boolean} [debug=false]
 */

/**
 * @typedef {Object} PexResource
 * All resources are plain js object and once constructed their properties can be accessed directly.
 * Please note those props are read only. To set new values or upload new data to GPU see [updating resources]{@link context~update}.
 * @property {string} name
 */

/**
 * @typedef {Object} PexCommand
 * @property {import("./pass.js").PassOptions} pass
 * @property {import("./pipeline.js").PipelineOptions} pipeline
 * @property {Object} attributes vertex attributes, map of `attibuteName: ctx.VertexBuffer`   or `attributeName: { buffer: VertexBuffer, offset: number, stride: number, divisor: number }`
 * @property {Object} indices indices, `ctx.IndexBuffer` or `{ buffer: IndexBuffer, offset: number, stride: number }`
 * @property {number} count number of vertices to draw
 * @property {number} instances number instances to draw
 * @property {Object} uniforms shader uniforms, map of `name: value`
 * @property {Viewport} viewport drawing viewport bounds
 * @property {Viewport} scissor scissor test bounds
 */

/**
 * @typedef {Object} PexContextSetOptions
 * @property {number} [width]
 * @property {number} [height]
 * @property {number} [pixelRatio]
 */

/**
 * @typedef {number[]} Viewport [x, y, w, h]
 */
/**
 * @typedef {number[]} Color [r, g, b, a]
 */

export const addEnums = (ctx) => {
  const { gl, capabilities } = ctx;

  /** @enum */
  ctx.BlendFactor = {
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

  /** @enum */
  ctx.CubemapFace = {
    PositiveX: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    NegativeX: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    PositiveY: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    NegativeY: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    PositiveZ: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    NegativeZ: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  };

  /** @enum */
  ctx.DepthFunc = {
    Never: gl.NEVER,
    Less: gl.LESS,
    Equal: gl.EQUAL,
    LessEqual: gl.LEQUAL,
    Greater: gl.GREATER,
    NotEqual: gl.NOTEQUAL,
    GreaterEqual: gl.GEQUAL,
    Always: gl.ALWAYS,
  };

  /**
   * @enum
   * @private
   */
  ctx.DataType = {
    Float16: gl.HALF_FLOAT,
    Float32: gl.FLOAT,
    Int8: gl.BYTE,
    Int16: gl.SHORT,
    Int32: gl.INT,
    Uint8: gl.UNSIGNED_BYTE,
    Uint16: gl.UNSIGNED_SHORT,
    Uint32: gl.UNSIGNED_INT,
  };

  /**
   * @enum
   * @private
   */
  ctx.DataTypeConstructor = {
    [ctx.DataType.Float16]: Float32Array,
    [ctx.DataType.Float32]: Float32Array,
    [ctx.DataType.Int8]: Int8Array,
    [ctx.DataType.Int16]: Int16Array,
    [ctx.DataType.Int32]: Int32Array,
    [ctx.DataType.Uint8]: Uint8Array,
    [ctx.DataType.Uint16]: Uint16Array,
    [ctx.DataType.Uint32]: Uint32Array,
  };

  /**
   * @enum
   * @private
   */
  ctx.UniformMethod = {
    [gl.BOOL]: "uniform1i",
    [gl.INT]: "uniform1i",

    [gl.SAMPLER_2D]: "uniform1i",
    [gl.INT_SAMPLER_2D]: "uniform1i",
    [gl.UNSIGNED_INT_SAMPLER_2D]: "uniform1i",
    [gl.SAMPLER_2D_SHADOW]: "uniform1i",
    [gl.SAMPLER_2D_ARRAY]: "uniform1i",
    [gl.INT_SAMPLER_2D_ARRAY]: "uniform1i",
    [gl.UNSIGNED_INT_SAMPLER_2D_ARRAY]: "uniform1i",
    [gl.SAMPLER_2D_ARRAY_SHADOW]: "uniform1i",
    [gl.SAMPLER_CUBE]: "uniform1i",
    [gl.INT_SAMPLER_CUBE]: "uniform1i",
    [gl.UNSIGNED_INT_SAMPLER_CUBE]: "uniform1i",
    [gl.SAMPLER_CUBE_SHADOW]: "uniform1i",
    [gl.SAMPLER_3D]: "uniform1i",
    [gl.INT_SAMPLER_3D]: "uniform1i",
    [gl.UNSIGNED_INT_SAMPLER_3D]: "uniform1i",

    [gl.UNSIGNED_INT]: "uniform1ui",

    [gl.FLOAT]: "uniform1f",
    [gl.FLOAT_VEC2]: "uniform2fv",
    [gl.FLOAT_VEC3]: "uniform3fv",
    [gl.FLOAT_VEC4]: "uniform4fv",

    [gl.INT_VEC2]: "uniform2iv",
    [gl.INT_VEC3]: "uniform3iv",
    [gl.INT_VEC4]: "uniform4iv",

    [gl.UNSIGNED_INT_VEC2]: "uniform2uiv",
    [gl.UNSIGNED_INT_VEC3]: "uniform3uiv",
    [gl.UNSIGNED_INT_VEC4]: "uniform4uiv",

    [gl.BOOL_VEC2]: "uniform2iv",
    [gl.BOOL_VEC3]: "uniform3iv",
    [gl.BOOL_VEC4]: "uniform4iv",

    [gl.FLOAT_MAT2]: "uniformMatrix2fv",
    [gl.FLOAT_MAT3]: "uniformMatrix3fv",
    [gl.FLOAT_MAT4]: "uniformMatrix4fv",

    [gl.FLOAT_MAT2x3]: "uniformMatrix2x3fv",
    [gl.FLOAT_MAT2x4]: "uniformMatrix2x4fv",
    [gl.FLOAT_MAT3x2]: "uniformMatrix3x2fv",
    [gl.FLOAT_MAT3x4]: "uniformMatrix3x4fv",
    [gl.FLOAT_MAT4x2]: "uniformMatrix4x2fv",
    [gl.FLOAT_MAT4x3]: "uniformMatrix4x3fv",
  };

  /**
   * @enum
   * @private
   */
  ctx.UniformSize = {
    [gl.BOOL]: 1,
    [gl.INT]: 1,

    [gl.SAMPLER_2D]: 1,
    [gl.INT_SAMPLER_2D]: 1,
    [gl.UNSIGNED_INT_SAMPLER_2D]: 1,
    [gl.SAMPLER_2D_SHADOW]: 1,
    [gl.SAMPLER_2D_ARRAY]: 1,
    [gl.INT_SAMPLER_2D_ARRAY]: 1,
    [gl.UNSIGNED_INT_SAMPLER_2D_ARRAY]: 1,
    [gl.SAMPLER_2D_ARRAY_SHADOW]: 1,
    [gl.SAMPLER_CUBE]: 1,
    [gl.INT_SAMPLER_CUBE]: 1,
    [gl.UNSIGNED_INT_SAMPLER_CUBE]: 1,
    [gl.SAMPLER_CUBE_SHADOW]: 1,
    [gl.SAMPLER_3D]: 1,
    [gl.INT_SAMPLER_3D]: 1,
    [gl.UNSIGNED_INT_SAMPLER_3D]: 1,

    [gl.UNSIGNED_INT]: 1,

    [gl.FLOAT]: 1,
    [gl.FLOAT_VEC2]: 2,
    [gl.FLOAT_VEC3]: 3,
    [gl.FLOAT_VEC4]: 4,

    [gl.INT_VEC2]: 2,
    [gl.INT_VEC3]: 3,
    [gl.INT_VEC4]: 4,

    [gl.UNSIGNED_INT_VEC2]: 2,
    [gl.UNSIGNED_INT_VEC3]: 3,
    [gl.UNSIGNED_INT_VEC4]: 4,

    [gl.BOOL_VEC2]: 2,
    [gl.BOOL_VEC3]: 3,
    [gl.BOOL_VEC4]: 4,

    [gl.FLOAT_MAT2]: 4,
    [gl.FLOAT_MAT3]: 9,
    [gl.FLOAT_MAT4]: 16,

    [gl.FLOAT_MAT2x3]: 6,
    [gl.FLOAT_MAT2x4]: 8,
    [gl.FLOAT_MAT3x2]: 6,
    [gl.FLOAT_MAT3x4]: 12,
    [gl.FLOAT_MAT4x2]: 8,
    [gl.FLOAT_MAT4x3]: 12,
  };

  /**
   * @enum
   * @private
   */
  ctx.AttributeSize = {
    [gl.INT]: 1,

    [gl.UNSIGNED_INT]: 1,
    [gl.FLOAT]: 1,
    [gl.FLOAT_VEC2]: 2,
    [gl.FLOAT_VEC3]: 3,
    [gl.FLOAT_VEC4]: 4,

    [gl.INT_VEC2]: 2,
    [gl.INT_VEC3]: 3,
    [gl.INT_VEC4]: 4,

    [gl.UNSIGNED_INT_VEC2]: 2,
    [gl.UNSIGNED_INT_VEC3]: 3,
    [gl.UNSIGNED_INT_VEC4]: 4,

    [gl.FLOAT_MAT2]: 4,
    [gl.FLOAT_MAT3]: 9,
    [gl.FLOAT_MAT4]: 16,
  };

  /** @enum */
  ctx.Face = {
    Front: gl.FRONT,
    Back: gl.BACK,
    FrontAndBack: gl.FRONT_AND_BACK,
  };

  /** @enum */
  ctx.Filter = {
    Nearest: gl.NEAREST,
    Linear: gl.LINEAR,
    NearestMipmapNearest: gl.NEAREST_MIPMAP_NEAREST,
    NearestMipmapLinear: gl.NEAREST_MIPMAP_LINEAR,
    LinearMipmapNearest: gl.LINEAR_MIPMAP_NEAREST,
    LinearMipmapLinear: gl.LINEAR_MIPMAP_LINEAR,
  };

  /**
   * @enum
   *
   * @description
   * Mapping of format and type (with alternative types).
   */
  ctx.TextureFormat = {
    // Unsized Internal Formats
    RGB: [gl.RGB, ctx.DataType.Uint8], // gl.UNSIGNED_SHORT_5_6_5
    RGBA: [gl.RGBA, ctx.DataType.Uint8], // gl.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_5_5_5_1
    LUMINANCE_ALPHA: [gl.LUMINANCE_ALPHA, ctx.DataType.Uint8],
    LUMINANCE: [gl.LUMINANCE, ctx.DataType.Uint8],
    ALPHA: [gl.ALPHA, ctx.DataType.Uint8],

    // Sized internal formats
    R8: [gl.RED, ctx.DataType.Uint8],
    R8_SNORM: [gl.RED, ctx.DataType.Int8],
    R16F: [gl.RED, ctx.DataType.Float16], // ctx.DataType.Float32
    R32F: [gl.RED, ctx.DataType.Float32],

    R8UI: [gl.RED_INTEGER, ctx.DataType.Uint8],
    R8I: [gl.RED_INTEGER, ctx.DataType.Int8],
    R16UI: [gl.RED_INTEGER, ctx.DataType.Uint16],
    R16I: [gl.RED_INTEGER, ctx.DataType.Int16],
    R32UI: [gl.RED_INTEGER, ctx.DataType.Uint32],
    R32I: [gl.RED_INTEGER, ctx.DataType.Int32],

    RG8: [gl.RG, ctx.DataType.Uint8],
    RG8_SNORM: [gl.RG, ctx.DataType.Int8],
    RG16F: [gl.RG, ctx.DataType.Float16], // ctx.DataType.Float32
    RG32F: [gl.RG, ctx.DataType.Float32],

    RG8UI: [gl.RG_INTEGER, ctx.DataType.Uint8],
    RG8I: [gl.RG_INTEGER, ctx.DataType.Int8],
    RG16UI: [gl.RG_INTEGER, ctx.DataType.Uint16],
    RG16I: [gl.RG_INTEGER, ctx.DataType.Int16],
    RG32UI: [gl.RG_INTEGER, ctx.DataType.Uint32],
    RG32I: [gl.RG_INTEGER, ctx.DataType.Int32],

    RGB8: [gl.RGB, ctx.DataType.Uint8],
    SRGB8: [gl.RGB, ctx.DataType.Uint8],
    RGB565: [gl.RGB, gl.UNSIGNED_SHORT_5_6_5], // ctx.DataType.Uint8
    RGB8_SNORM: [gl.RGB, ctx.DataType.Int8],
    R11F_G11F_B10F: [gl.RGB, gl.UNSIGNED_INT_10F_11F_11F_REV], // ctx.DataType.Float16, ctx.DataType.Float32
    RGB9_E5: [gl.RGB, gl.UNSIGNED_INT_5_9_9_9_REV], // ctx.DataType.Float16, ctx.DataType.Float32
    RGB16F: [gl.RGB, ctx.DataType.Float16], // ctx.DataType.Float32
    RGB32F: [gl.RGB, ctx.DataType.Float32],

    RGB8UI: [gl.RGB_INTEGER, ctx.DataType.Uint8],
    RGB8I: [gl.RGB_INTEGER, ctx.DataType.Int8],
    RGB16UI: [gl.RGB_INTEGER, ctx.DataType.Uint16],
    RGB16I: [gl.RGB_INTEGER, ctx.DataType.Int16],
    RGB32UI: [gl.RGB_INTEGER, ctx.DataType.Uint32],
    RGB32I: [gl.RGB_INTEGER, ctx.DataType.Int32],

    RGBA8: [gl.RGBA, ctx.DataType.Uint8],
    SRGB8_ALPHA8: [gl.RGBA, ctx.DataType.Uint8],
    RGBA8_SNORM: [gl.RGBA, ctx.DataType.Int8],
    RGB5_A1: [gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1], // ctx.DataType.Uint8, gl.UNSIGNED_INT_2_10_10_10_REV
    RGBA4: [gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4], // ctx.DataType.Uint8
    RGB10_A2: [gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV],
    RGBA16F: [gl.RGBA, ctx.DataType.Float16], // ctx.DataType.Float32
    RGBA32F: [gl.RGBA, ctx.DataType.Float32],

    RGBA8UI: [gl.RGBA_INTEGER, ctx.DataType.Uint8],
    RGBA8I: [gl.RGBA_INTEGER, ctx.DataType.Int8],
    RGB10_A2UI: [gl.RGBA_INTEGER, gl.UNSIGNED_INT_2_10_10_10_REV],
    RGBA16UI: [gl.RGBA_INTEGER, ctx.DataType.Uint16],
    RGBA16I: [gl.RGBA_INTEGER, ctx.DataType.Int16],
    RGBA32I: [gl.RGBA_INTEGER, ctx.DataType.Int32],
    RGBA32UI: [gl.RGBA_INTEGER, ctx.DataType.Uint32],

    // Depth and stencil
    DEPTH_COMPONENT16: [gl.DEPTH_COMPONENT, ctx.DataType.Uint16], // ctx.DataType.Uint32
    DEPTH_COMPONENT24: [gl.DEPTH_COMPONENT, ctx.DataType.Uint32],
    DEPTH_COMPONENT32F: [gl.DEPTH_COMPONENT, ctx.DataType.Float32],
    DEPTH24_STENCIL8: [gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8],
    DEPTH32F_STENCIL8: [gl.DEPTH_STENCIL, gl.FLOAT_32_UNSIGNED_INT_24_8_REV],
  };
  if (gl instanceof WebGLRenderingContext) {
    if (capabilities.depthTexture) {
      ctx.TextureFormat.DEPTH_COMPONENT = [
        gl.DEPTH_COMPONENT,
        ctx.DataType.Uint16,
      ];
      ctx.TextureFormat.DEPTH_STENCIL = [gl.DEPTH_STENCIL, ctx.DataType.Uint16];
    }
    ctx.TextureFormat.R16FLegacy = [gl.ALPHA, ctx.DataType.Float16];
    ctx.TextureFormat.R32FLegacy = [gl.ALPHA, ctx.DataType.Float32];
  }

  /**
   * @enum
   * @description
   * Mapping of {@link #ctx.TextureFormat|ctx.TextureFormat} keys to their string values and legacy depth formats
   */
  ctx.PixelFormat = {
    ...Object.fromEntries(
      Object.keys(ctx.TextureFormat).map((internalFormat) => [
        internalFormat,
        internalFormat,
      ])
    ),
    // Legacy
    Depth: "DEPTH_COMPONENT16",
    Depth16: "DEPTH_COMPONENT16",
    Depth24: "DEPTH_COMPONENT24",
  };

  const extColorBufferFloat = !!gl.getExtension("EXT_color_buffer_float"); // WebGL2 only

  /** @enum */
  ctx.RenderbufferFloatFormat = {
    // With EXT_color_buffer_float, types just become color-renderable
    // With EXT_color_buffer_half_float and WEBGL_color_buffer_float,
    // they come from the extension and need _EXT suffix
    RGBA32F:
      (extColorBufferFloat && gl.RGBA32F) ||
      gl.getExtension("WEBGL_color_buffer_float").RGBA32F_EXT, // WebGL1 only
    RGBA16F:
      (extColorBufferFloat && gl.RGBA16F) ||
      gl.getExtension("EXT_color_buffer_half_float").RGBA16F_EXT, // WebGL1/2
    R16F: extColorBufferFloat && gl.R16F,
    RG16F: extColorBufferFloat && gl.RG16F,
    R32F: extColorBufferFloat && gl.R32F,
    RG32F: extColorBufferFloat && gl.RG32F,
    R11F_G11F_B10F: extColorBufferFloat && gl.R11F_G11F_B10F,
  };

  /** @enum */
  ctx.Encoding = {
    Linear: 1,
    Gamma: 2,
    SRGB: 3,
    RGBM: 4,
  };

  /** @enum */
  ctx.Primitive = {
    Points: gl.POINTS,
    Lines: gl.LINES,
    LineStrip: gl.LINE_STRIP,
    Triangles: gl.TRIANGLES,
    TriangleStrip: gl.TRIANGLE_STRIP,
  };

  /** @enum */
  ctx.Usage = {
    StaticDraw: gl.STATIC_DRAW,
    DynamicDraw: gl.DYNAMIC_DRAW,
    StreamDraw: gl.STREAM_DRAW,
  };

  /** @enum */
  ctx.Wrap = {
    ClampToEdge: gl.CLAMP_TO_EDGE,
    Repeat: gl.REPEAT,
  };

  /** @enum */
  ctx.QueryTarget = {
    TimeElapsed: gl.TIME_ELAPSED,
    // webgl2
    AnySamplesPassed: gl.ANY_SAMPLES_PASSED,
    AnySamplesPassedConservative: gl.ANY_SAMPLES_PASSED_CONSERVATIVE,
    TransformFeedbackPrimitivesWritten:
      gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN,
  };

  /** @enum */
  ctx.QueryState = {
    Ready: "ready",
    Active: "active",
    Pending: "pending",
  };
};
