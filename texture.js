import { checkProps } from "./utils.js";

/**
 * @typedef {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} TextureOptionsData
 * @property {Array|import("./types.js").TypedArray} data
 * @property {number} width
 * @property {number} height
 */

/**
 * @typedef {WebGLRenderingContext.TEXTURE_2D | WebGLRenderingContext.TEXTURE_CUBE_MAP | WebGL2RenderingContext.TEXTURE_2D_ARRAY | WebGL2RenderingContext.TEXTURE_3D} TextureTarget
 */

/**
 * @typedef {import("./types.js").PexResource} TextureOptions
 * @property {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | Array | import("./types.js").TypedArray |TextureOptionsData | HTMLImageElement[] | TextureOptionsData[]} [data]
 * @property {number} [width]
 * @property {number} [height]
 * @property {ctx.PixelFormat} [pixelFormat=ctx.PixelFormat.RGB8]
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
 */

/**
 * @typedef {import("./types.js").PexResource} TextureCubeOptions
 * @augments TextureOptions
 * @property {HTMLImageElement[]|import("./types.js").TypedArray[]} [data] 6 images, one for each face +X, -X, +Y, -Y, +Z, -Z
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
];

function createTexture(ctx, opts) {
  checkProps(allowedProps, opts);

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

function updateTexture(ctx, texture, opts) {
  // checkProps(allowedProps, opts)

  const gl = ctx.gl;
  let compressed = opts.compressed || texture.compressed;

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
  let internalFormat = opts.internalFormat || texture.internalFormat;
  let type;
  let format;

  const isTexture2DArray = target === gl.TEXTURE_2D_ARRAY;

  const textureUnit = 0;
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(texture.target, texture.handle);
  ctx.state.activeTextures[textureUnit] = texture;

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha);
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag);
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min);
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT);
  if (ctx.capabilities.textureFilterAnisotropic && aniso > 0) {
    const anisoExt = gl.getExtension("EXT_texture_filter_anisotropic");
    gl.texParameterf(target, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, aniso);
  }

  const img = opts.data ? opts.data : opts;
  if (
    (img && img.nodeName) ||
    (!ctx.capabilities.isWebGL2 && img instanceof ImageBitmap)
  ) {
    console.assert(
      img instanceof HTMLImageElement ||
        img instanceof HTMLVideoElement ||
        img instanceof HTMLCanvasElement ||
        img instanceof ImageBitmap,
      "Texture2D.update opts has to be HTMLImageElement, HTMLVideoElement, HTMLCanvasElement or ImageBitmap",
    );
    width = img.width || img.videoHeight;
    height = img.height || img.videoHeight;
    internalFormat = gl.RGBA;
    format = gl.RGBA;
    type = gl.UNSIGNED_BYTE;
    pixelFormat = ctx.PixelFormat.RGBA;
    gl.texImage2D(target, 0, internalFormat, format, type, img);
    texture.width = width;
    texture.height = height;
  } else if (typeof opts === "object") {
    // Check data type
    console.assert(
      !data ||
        Array.isArray(opts.data) ||
        Object.values(ctx.DataTypeConstructor).some(
          (TypedArray) => opts.data instanceof TypedArray,
        ),
      "Texture2D.update opts.data has to be null, an Array or a TypedArray",
    );

    // Handle pixel data with flags
    data = opts.data ? opts.data.data || opts.data : null;

    if (isTexture2DArray) {
      width ||= data[0]?.width;
      height ||= data[0]?.height;
    } else {
      width ||= data.width;
      height ||= data.height;
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

      updateTexture2D(ctx, texture, data);
    } else if (isTexture2DArray) {
      texture.width = width;
      texture.height = height;

      updateTexture2DArray(ctx, texture, data);
    } else if (target === gl.TEXTURE_CUBE_MAP) {
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

  texture.info = `${Object.keys(ctx.PixelFormat).find(
    (key) => ctx.PixelFormat[key] === pixelFormat,
  )}_${Object.keys(ctx.Encoding).find(
    (key) => ctx.Encoding[key] === encoding,
  )}`;

  return texture;
}

function updateTexture2D(ctx, texture, data) {
  const gl = ctx.gl;
  const { internalFormat, format, type, target, compressed } = texture;

  for (let level = 0; level < data.length; level++) {
    let { data: levelData, width, height } = data[level];

    // Convert array of numbers to typed array
    if (Array.isArray(levelData)) {
      const TypedArray = ctx.DataTypeConstructor[type];
      console.assert(TypedArray, `Unknown texture data type: ${type}`);
      levelData = new TypedArray(levelData);
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
      gl.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        levelData,
      );
    }
  }
}

// TODO: compressed and lod
function updateTexture2DArray(ctx, texture, data) {
  const gl = ctx.gl;
  const {
    internalFormat,
    format,
    type,
    target,
    width,
    height = width,
  } = texture;

  gl.texStorage3D(
    gl.TEXTURE_2D_ARRAY,
    1,
    internalFormat,
    width,
    height,
    data.length,
  );

  let lod = 0;

  for (let i = 0; i < data.length; i++) {
    const pixels = data[i].data || data[i];

    gl.texSubImage3D(
      target,
      lod,
      0,
      0,
      i,
      width,
      height,
      1,
      format,
      type,
      pixels,
    );
  }
}

function updateTextureCube(ctx, texture, data) {
  console.assert(
    !data || (Array.isArray(data) && data.length === 6),
    "TextureCube requires data for 6 faces",
  );

  const gl = ctx.gl;
  const { internalFormat, format, type, width, height = width } = texture;

  // TODO: gl.compressedTexImage2D, manual mimaps
  let lod = 0;

  for (let i = 0; i < 6; i++) {
    let faceData = data ? data[i].data || data[i] : null;
    const faceTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    if (Array.isArray(faceData)) {
      // Convert array of numbers to typed array
      const TypedArray = ctx.DataTypeConstructor[type];
      console.assert(TypedArray, `Unknown texture data type: ${type}`);
      faceData = new TypedArray(faceData);

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
    } else if (faceData && faceData.nodeName) {
      gl.texImage2D(faceTarget, lod, internalFormat, format, type, faceData);
    } else {
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
