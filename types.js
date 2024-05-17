/**
 * @typedef {object} PexContextOptions
 * @property {WebGLRenderingContext | WebGL2RenderingContext} [gl=WebGL2RenderingContext]
 * @property {number} [width=window.innerWidth]
 * @property {number} [height=window.innerHeight]
 * @property {number} [pixelRatio=1]
 * @property {"webgl" | "webgl2"} [type="webgl2"]
 * @property {boolean} [debug=false]
 */

/**
 * @typedef {object} PexResource
 * All resources are plain js object and once constructed their properties can be accessed directly.
 * Please note those props are read only. To set new values or upload new data to GPU see [updating resources]{@link ctx.update}.
 * @property {string} name
 */

/**
 * @typedef {object} PexTexture2D
 */

/**
 * @typedef {object} PexAttribute
 * @property {object} buffer ctx.vertexBuffer() or ctx.indexBuffer()
 * @property {number} [offset]
 * @property {number} [stride]
 * @property {number} [divisor]
 * @property {boolean} [normalized]
 */

/**
 * @typedef {object} PexCommand
 * @property {import("./pass.js").PassOptions} pass
 * @property {import("./pipeline.js").PipelineOptions} pipeline
 * @property {object} [attributes] vertex attributes, map of `attributeName: ctx.vertexBuffer()`  or [`attributeName: PexAttribute`]{@link PexAttribute}
 * @property {object} [indices] indices, `ctx.indexBuffer()` or [`PexAttribute`]{@link PexAttribute}
 * @property {number} [count] number of vertices to draw
 * @property {number} [instances] number instances to draw
 * @property {object} [uniforms] shader uniforms, map of `name: value`
 * @property {Viewport} [viewport] drawing viewport bounds
 * @property {Viewport} [scissor] scissor test bounds
 * @property {MultiDrawOptions} [multiDraw]
 * @property {number} [baseVertex]
 * @property {number} [baseInstance]
 */
/**
 * @typedef {object} MultiDrawOptions
 * @see [WEBGL_multi_draw extension]{@link https://registry.khronos.org/webgl/extensions/WEBGL_multi_draw/}
 * @see [WEBGL_draw_instanced_base_vertex_base_instance extension]{@link https://registry.khronos.org/webgl/extensions/WEBGL_draw_instanced_base_vertex_base_instance/}
 * @see [WEBGL_multi_draw_instanced_base_vertex_base_instance extension]{@link https://registry.khronos.org/webgl/extensions/WEBGL_multi_draw_instanced_base_vertex_base_instance/}
 *
 * @property {(Int32Array|Array)} counts
 * @property {number} [countsOffset]
 * @property {(Int32Array|Array)} offsets
 * @property {number} [offsetsOffset]
 * @property {(Int32Array|Array)} firsts
 * @property {number} [firstsOffset]
 * @property {(Int32Array|Array)} instanceCounts
 * @property {number} [instanceCountsOffset]
 *
 * @property {(Int32Array|Array)} baseVertices
 * @property {number} [baseVerticesOffset]
 * @property {(UInt32Array|Array)} baseInstances
 * @property {number} [baseInstancesOffset]
 * @property {number} [drawCount]
 */

/**
 * @typedef {object} PexContextSetOptions
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

/**
 * @typedef {(Int8Array|Uint8Array|Uint8ClampedArray|Int16Array|Uint16Array|Int32Array|Uint32Array|Float32Array|Float64Array|BigInt64Array|BigUint64Array)} TypedArray
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
   * @private
   * @description
   * Mapping of format and type (with alternative types).
   */
  ctx.TextureFormat = {
    // Unsized internal formats
    RGB: [gl.RGB, ctx.DataType.Uint8], // gl.UNSIGNED_SHORT_5_6_5
    RGBA: [gl.RGBA, ctx.DataType.Uint8], // gl.UNSIGNED_SHORT_4_4_4_4, gl.UNSIGNED_SHORT_5_5_5_1
    LUMINANCE_ALPHA: [gl.LUMINANCE_ALPHA, ctx.DataType.Uint8],
    LUMINANCE: [gl.LUMINANCE, ctx.DataType.Uint8],
    ALPHA: [gl.ALPHA, ctx.DataType.Uint8],

    // Sized internal formats
    ...Object.fromEntries(
      ["R", "RG", "RGB", "RGBA"].flatMap((format) =>
        Object.entries({
          8: "Uint8",
          "8_SNORM": "Int8",
          "16F": "Float16", // ctx.DataType.Float32
          "32F": "Float32",

          "8UI": "Uint8",
          "8I": "Int8",
          "16UI": "Uint16",
          "16I": "Int16",
          "32UI": "Uint32",
          "32I": "Int32",
        }).map(([type, DataType]) => [
          [`${format}${type}`],
          [
            gl[
              `${format === "R" ? "RED" : format}${type.endsWith("I") ? "_INTEGER" : ""}`
            ],
            ctx.DataType[DataType],
          ],
        ]),
      ),
    ),

    // Special
    SRGB8: [gl.RGB, ctx.DataType.Uint8],
    RGB565: [gl.RGB, gl.UNSIGNED_SHORT_5_6_5], // ctx.DataType.Uint8
    R11F_G11F_B10F: [gl.RGB, gl.UNSIGNED_INT_10F_11F_11F_REV], // ctx.DataType.Float16, ctx.DataType.Float32
    RGB9_E5: [gl.RGB, gl.UNSIGNED_INT_5_9_9_9_REV], // ctx.DataType.Float16, ctx.DataType.Float32

    SRGB8_ALPHA8: [gl.RGBA, ctx.DataType.Uint8],
    RGB5_A1: [gl.RGBA, gl.UNSIGNED_SHORT_5_5_5_1], // ctx.DataType.Uint8, gl.UNSIGNED_INT_2_10_10_10_REV
    RGBA4: [gl.RGBA, gl.UNSIGNED_SHORT_4_4_4_4], // ctx.DataType.Uint8
    RGB10_A2: [gl.RGBA, gl.UNSIGNED_INT_2_10_10_10_REV],

    RGB10_A2UI: [gl.RGBA_INTEGER, gl.UNSIGNED_INT_2_10_10_10_REV],

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

  const legacyPixelFormat = {
    Depth: "DEPTH_COMPONENT16",
    Depth16: "DEPTH_COMPONENT16",
    Depth24: "DEPTH_COMPONENT24",
  };

  /**
   * @enum
   * @description
   * Mapping of {@link #ctx.TextureFormat|ctx.TextureFormat} keys to their string values and legacy depth formats
   *
   * One of:
   * - Unsized: RGB, RGBA, LUMINANCE_ALPHA, LUMINANCE, ALPHA
   * - Sized 1 component: R8, R8_SNORM, R16F, R32F, R8UI, R8I, R16UI, R16I, R32UI, R32I
   * - Sized 2 components: RG8, RG8_SNORM, RG16F, RG32F, RG8UI, RG8I, RG16UI, RG16I, RG32UI, RG32I
   * - Sized 3 components: RGB8, RGB8_SNORM, RGB16F, RGB32F, RGB8UI, RGB8I, RGB16UI, RGB16I, RGB32UI, RGB32I
   * - Sized 4 components: RGBA8, RGBA8_SNORM, RGBA16F, RGBA32F, RGBA8UI, RGBA8I, RGBA16UI, RGBA16I, RGBA32UI, RGBA32I
   * - Sized special: SRGB8, RGB565, R11F_G11F_B10F, RGB9_E5, SRGB8_ALPHA8, RGB5_A1, RGBA4, RGB10_A2, RGB10_A2UI
   * - Sized depth/stencil: DEPTH_COMPONENT16, DEPTH_COMPONENT24, DEPTH_COMPONENT32F, DEPTH24_STENCIL8, DEPTH32F_STENCIL8
   */
  ctx.PixelFormat = {
    ...Object.fromEntries(
      Object.keys(ctx.TextureFormat).map((internalFormat) => [
        internalFormat,
        internalFormat,
      ]),
    ),
    ...legacyPixelFormat,
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
