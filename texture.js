import { checkProps, isObject } from "./utils.js";

/**
 * @typedef {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} TextureOptionsData
 * @property {Array | import("./types.js").TypedArray} data
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {WebGLRenderingContext.TEXTURE_2D | WebGLRenderingContext.TEXTURE_CUBE_MAP | WebGL2RenderingContext.TEXTURE_2D_ARRAY | WebGL2RenderingContext.TEXTURE_3D} TextureTarget
 */

/**
 * @typedef {import("./types.js").PexResource} TextureOptions
 * @property {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | Array | import("./types.js").TypedArray | TextureOptionsData} [data]
 * @property {number} [width]
 * @property {number} [height]
 * @property {ctx.PixelFormat} [pixelFormat=ctx.PixelFormat.RGBA8]
 * @property {ctx.TextureFormat} [internalFormat=ctx.TextureFormat.RGBA]
 * @property {ctx.DataType} [type=ctx.TextureFormat[opts.pixelFormat]]
 * @property {ctx.Encoding} [encoding=ctx.Encoding.Linear]
 * @property {ctx.Wrap} [wrapS=ctx.Wrap.ClampToEdge]
 * @property {ctx.Wrap} [wrapT=ctx.Wrap.ClampToEdge]
 * @property {ctx.Wrap} [wrap=ctx.Wrap.ClampToEdge]
 * @property {ctx.Filter} [min=ctx.Filter.Nearest]
 * @property {ctx.Filter} [mag=ctx.Filter.Nearest]
 * @property {number} [aniso=0] requires [EXT_texture_filter_anisotropic](https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/)
 * @property {boolean} [mipmap=true] requires `min` to be set to `ctx.Filter.LinearMipmapLinear` or similar
 * @property {boolean} [premultiplyAlpha=false]
 * @property {boolean} [flipY=false]
 * @property {boolean} [compressed=false]
 * @property {TextureTarget} [target]
 * @property {number} [offset]
 */

/**
 * @typedef {import("./types.js").PexResource} Texture2DArrayOptions
 * @augments TextureOptions
 * @property {HTMLImageElement[] | TextureOptionsData[] | Array[] | import("./types.js").TypedArray[]} [data]
 */

/**
 * @typedef {import("./types.js").PexResource} TextureCubeOptions
 * @augments TextureOptions
 * @property {HTMLImageElement[] | import("./types.js").TypedArray[]} [data] 6 images, one for each face +X, -X, +Y, -Y, +Z, -Z
 */

const allowedProps = [
  "name",
  "data",
  "width",
  "height",
  "pixelFormat",
  "internalFormat",
  "type",
  "encoding",
  "flipY",
  "mipmap",
  "target",
  "min",
  "mag",
  "wrap",
  "wrapS",
  "wrapT",
  "aniso",
  "premultiplyAlpha",
  "compressed",
  "offset",
];

function createTexture(ctx, opts) {
  if (isObject(opts)) checkProps(allowedProps, opts);

  const gl = ctx.gl;

  const texture = {
    class: "texture",
    handle: gl.createTexture(),
    target: opts.target,
    width: 0,
    height: 0,
    _update: updateTexture,
    _dispose() {
      gl.deleteTexture(this.handle);
      this.handle = null;
    },
  };

  updateTexture(ctx, texture, opts);

  return texture;
}

function orValue(a, b) {
  return a !== undefined ? a : b;
}

const isElement = (element) => element && element instanceof Element;
const isBuffer = (object) =>
  ["vertexBuffer", "indexBuffer"].includes(object?.class);

const arrayToTypedArray = (ctx, type, array) => {
  const TypedArray = ctx.DataTypeConstructor[type];
  console.assert(TypedArray, `Unknown texture data type: ${type}`);
  return new TypedArray(array);
};

function updateTexture(ctx, texture, opts) {
  // checkProps(allowedProps, opts)

  const gl = ctx.gl;

  let data = null;
  let width = opts.width;
  let height = opts.height;
  let flipY = orValue(opts.flipY, orValue(texture.flipY, false));
  let target = opts.target || texture.target;
  let pixelFormat =
    opts.pixelFormat || texture.pixelFormat || ctx.PixelFormat.RGBA8;
  const encoding = opts.encoding || texture.encoding || ctx.Encoding.Linear;
  const min = opts.min || texture.min || gl.NEAREST;
  const mag = opts.mag || texture.mag || gl.NEAREST;
  const wrapS =
    opts.wrapS ||
    opts.wrap ||
    texture.wrapS ||
    texture.wrap ||
    gl.CLAMP_TO_EDGE;
  const wrapT =
    opts.wrapT ||
    opts.wrap ||
    texture.wrapT ||
    texture.wrap ||
    gl.CLAMP_TO_EDGE;
  const aniso = opts.aniso || texture.aniso || 0;
  const premultiplyAlpha = orValue(
    opts.premultiplyAlpha,
    orValue(texture.premultiplyAlpha, false),
  );
  const compressed = opts.compressed || texture.compressed;

  let internalFormat = opts.internalFormat || texture.internalFormat;
  let type;
  let format;

  // Bind
  const textureUnit = 0;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(target, texture.handle);
  ctx.state.activeTextures[textureUnit] = texture;

  // Pixel storage mode
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha);

  // Parameters
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT);
  if (ctx.capabilities.textureFilterAnisotropic && aniso > 0) {
    const anisoExt = gl.getExtension("EXT_texture_filter_anisotropic");
    gl.texParameterf(target, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, aniso);
  }

  // Data provided as element or ImageBitmap:
  // - width/height are retrieved from the element
  // - format/type are set to defaults
  const element = opts.data || opts;
  if (
    isElement(element) ||
    (!ctx.capabilities.isWebGL2 && element instanceof ImageBitmap)
  ) {
    console.assert(
      element instanceof HTMLImageElement ||
        element instanceof HTMLVideoElement ||
        element instanceof HTMLCanvasElement ||
        element instanceof ImageBitmap,
      "Texture2D.update opts has to be HTMLImageElement, HTMLVideoElement, HTMLCanvasElement or ImageBitmap",
    );

    pixelFormat ||= ctx.PixelFormat.RGBA;

    texture.internalFormat = gl[pixelFormat];
    texture.format = gl.RGBA;
    texture.type = gl.UNSIGNED_BYTE;
    texture.target = target;
    texture.compressed = false;

    texture.width = element.videoWidth || element.width;
    texture.height = element.videoHeight || element.height;

    gl.texImage2D(
      texture.target,
      0,
      texture.internalFormat,
      texture.format,
      texture.type,
      element,
    );
  }
  // Data provided as object:
  else if (typeof opts === "object") {
    // Check data type
    console.assert(
      !data ||
        Array.isArray(opts.data) ||
        Object.values(ctx.DataTypeConstructor).some(
          (TypedArray) => opts.data instanceof TypedArray,
        ),
      "Texture2D.update opts.data has to be null, an Array or a TypedArray",
    );

    const isTexture2DArray = target === gl.TEXTURE_2D_ARRAY;
    const isTextureCube = target === gl.TEXTURE_CUBE_MAP;

    if (isTexture2DArray || isTextureCube) {
      data = Array.isArray(opts) && opts.length ? opts : (opts.data ?? null);

      width ||= data?.[0]?.data?.width || data?.[0]?.width;
      height ||= data?.[0]?.data?.height || data?.[0]?.height;
    } else {
      // Handle pixel data with flags
      data = opts.data ? opts.data.data || opts.data : null;

      // Update can be called without width/height (for flags only changes)
      width ||= data?.width;
      height ||= data?.height;
    }

    console.assert(
      !data || (width !== undefined && height !== undefined),
      "Texture2D.update opts.width and opts.height are required when providing opts.data",
    );

    // Get internalFormat (format the GPU use internally) from opts.internalFormat (mainly for compressed texture) or pixelFormat
    if (!internalFormat || opts.internalFormat) {
      internalFormat = opts.internalFormat || gl[pixelFormat];

      // WebGL1
      if (ctx.gl instanceof WebGLRenderingContext) {
        // WEBGL_depth_texture (WebGL1 only) just adds DEPTH_COMPONENT and DEPTH_STENCIL
        if (
          ctx.capabilities.depthTexture &&
          ["DEPTH_COMPONENT16", "DEPTH_COMPONENT24"].includes(pixelFormat)
        ) {
          internalFormat = gl["DEPTH_COMPONENT"];
        }

        // Handle legacy types
        if (!internalFormat) {
          if (pixelFormat === ctx.PixelFormat.R16F) {
            pixelFormat = "R16FLegacy";
            internalFormat = gl.ALPHA;
          } else if (pixelFormat === ctx.PixelFormat.R32F) {
            pixelFormat = "R32FLegacy";
            internalFormat = gl.ALPHA;
          } else if (pixelFormat === ctx.PixelFormat.RGBA8) {
            pixelFormat = ctx.PixelFormat.RGBA;
            internalFormat = gl.RGBA;
          } else if (
            pixelFormat === ctx.PixelFormat.RGBA16F ||
            pixelFormat === ctx.PixelFormat.RGBA32F
          ) {
            internalFormat = gl.RGBA;
          }
        }
      }

      console.assert(
        internalFormat,
        `Texture2D.update Unknown internalFormat "${internalFormat}" for pixelFormat "${pixelFormat}".`,
      );
    }

    // Get actual format and type (data supplied), allowing type override
    [format, type] = ctx.TextureFormat[pixelFormat];
    type = opts.type || type;
    console.assert(type, `Texture2D.update Unknown type ${type}.`);

    texture.internalFormat = internalFormat;
    texture.format = format;
    texture.type = type;
    texture.target = target;
    texture.compressed = compressed;

    if (target === gl.TEXTURE_2D) {
      // Prepare data for mipmaps
      data =
        Array.isArray(data) && data[0].data ? data : [{ data, width, height }];

      if (data[0].width) texture.width = data[0].width;
      if (data[0].height) texture.height = data[0].height;

      updateTexture2D(ctx, texture, data, opts);
    } else if (isTexture2DArray) {
      texture.width = width;
      texture.height = height;

      if (data?.length) updateTexture2DArray(ctx, texture, data);
    } else if (isTextureCube) {
      texture.width = width;
      texture.height = height;

      updateTextureCube(ctx, texture, data);
    }
  } else {
    // TODO: should i assert of throw new Error(msg)?
    throw new Error(
      "Texture2D.update opts has to be a HTMLElement, ImageBitmap or Object",
    );
  }

  if (opts.mipmap) gl.generateMipmap(texture.target);

  texture.pixelFormat = pixelFormat;
  texture.min = min;
  texture.mag = mag;
  texture.wrapS = wrapS;
  texture.wrapT = wrapT;
  texture.flipY = flipY;
  texture.encoding = encoding;
  texture.mipmap = opts.mipmap;

  texture.info = `${Object.keys(ctx.PixelFormat).find(
    (key) => ctx.PixelFormat[key] === pixelFormat,
  )}_${Object.keys(ctx.Encoding).find(
    (key) => ctx.Encoding[key] === encoding,
  )}`;

  return texture;
}

function updateTexture2D(ctx, texture, data, { offset } = {}) {
  const gl = ctx.gl;
  const { internalFormat, format, type, target, compressed } = texture;

  for (let level = 0; level < data.length; level++) {
    let { data: levelData, width, height } = data[level];

    if (Array.isArray(levelData)) {
      levelData = arrayToTypedArray(ctx, type, levelData);
    }

    if (compressed) {
      gl.compressedTexImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        0,
        levelData,
      );
    } else if (width && height) {
      const fromBuffer = isBuffer(levelData);
      if (fromBuffer) gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, levelData.handle);

      gl.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        fromBuffer ? (offset ?? 0) : levelData,
      );

      if (fromBuffer) gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    }
  }
}

function updateTexture2DArray(ctx, texture, data) {
  const gl = ctx.gl;
  const { internalFormat, format, type, target, width, height } = texture;

  const depth = data.length;

  // TODO: compressed and lod
  const lod = 0;

  for (let i = 0; i < depth; i++) {
    const pixels = data[i].data || data[i];
    const w = pixels.width ?? width;
    const h = pixels.height ?? height;

    if (i === 0) gl.texStorage3D(target, 1, internalFormat, w, h, depth);

    gl.texSubImage3D(target, lod, 0, 0, i, w, h, 1, format, type, pixels);
  }
}

function updateTextureCube(ctx, texture, data) {
  console.assert(
    !data || (Array.isArray(data) && data.length === 6),
    "TextureCube requires data for 6 faces",
  );

  const gl = ctx.gl;
  const { internalFormat, format, type, width, height } = texture;

  // TODO: gl.compressedTexImage2D, manual mimaps
  const lod = 0;

  for (let i = 0; i < 6; i++) {
    let faceData = data ? data[i].data || data[i] : null;
    const faceTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;

    if (isElement(faceData)) {
      gl.texImage2D(faceTarget, lod, internalFormat, format, type, faceData);
    } else {
      if (Array.isArray(faceData)) {
        faceData = arrayToTypedArray(ctx, type, faceData);
      }

      gl.texImage2D(
        faceTarget,
        lod,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        faceData,
      );
    }
  }
}

export default createTexture;
