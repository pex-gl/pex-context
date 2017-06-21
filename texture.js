const assert = require('assert')
const checkProps = require('./check-props')

const allowedProps = [
  'name',
  'data', 'width', 'height',
  'pixelFormat', 'encoding',
  'flipY',
  'mipmap',
  'target',
  'min', 'mag',
  'wrap',
  'premultiplayAlpha'
]


function createTexture (ctx, opts) {
  // checkProps(allowedProps, opts)

  const gl = ctx.gl

  // TODO: implement filtering options

  const texture = {
    class: 'texture',
    handle: gl.createTexture(),
    target: opts.target,
    width: 0,
    height: 0,
    _update: updateTexture2D
  }

  updateTexture2D(ctx, texture, opts)

  return texture
}

function orValue (a, b) {
  return (a !== undefined) ? a : b
}

// opts = { src, width, height }
// opts = { data, width, height, pixelFormat, encoding, flipY }
function updateTexture2D (ctx, texture, opts) {
  // checkProps(allowedProps, opts)

  const gl = ctx.gl
  const PixelFormat = ctx.PixelFormat

  let data = null
  let width = 0
  let height = 0
  let lod = 0
  let flipY = orValue(opts.flipY, orValue(texture.flipY, false))
  let target = opts.target || texture.target
  let pixelFormat = opts.pixelFormat || texture.pixelFormat
  let encoding = opts.encoding || texture.encoding
  let min = opts.min || texture.min || gl.NEAREST
  let mag = opts.min || texture.mag || gl.NEAREST
  let wrapS = opts.wrapS || texture.wrapS || opts.wrap || texture.wrap || gl.CLAMP_TO_EDGE
  let wrapT = opts.wrapS || texture.wrapS || opts.wrap || texture.wrap || gl.CLAMP_TO_EDGE
  let aniso = opts.aniso || texture.aniso || 0
  let premultiplayAlpha = orValue(opts.premultiplayAlpha, orValue(texture.premultiplayAlpha, false))
  let internalFormat = undefined
  let pixelformat = undefined
  let type = undefined

  assert(pixelFormat, 'PixelFormat is required')
  assert(encoding, 'Encoding is required')

  gl.getExtension('WEBGL_depth_texture')
  gl.getExtension('EXT_shader_texture_lod')
  gl.getExtension('OES_texture_float')
  gl.getExtension('OES_texture_float_linear')
  gl.getExtension('OES_texture_half_float')
  gl.getExtension('OES_texture_half_float_linear')
  var anisoExt = gl.getExtension('EXT_texture_filter_anisotropic')

  const textureUnit = 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(texture.target, texture.handle)
  ctx.state.activeTextures[textureUnit] = texture

  if (opts.mipmap) {
    if (opts.data || opts.width || opts.height) {
      throw new Error('Updating and generating mipmaps at the same time is currently not supported')
    }
    gl.generateMipmap(texture.target)
    return
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplayAlpha)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, min)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, mag)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT)
  if (anisoExt && aniso > 0) {
    gl.texParameterf(target, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, aniso);
  }

  // just an image
  // opts = HTMLImage

  // image with flags
  // opts = { data: HTMLImage, flipY: Boolean }

  // pixel data
  // opts = { data: Array, width: Number, height: Number, flipY: Boolean }

  // pixel data with flags
  // opts = { data: { data: Array, width: Number, height: Number }, flipY: Boolean },

  // array of images for cubemaps (and array textures in webgl2)
  // opts = { data: [ HTMLImage, ... ], width: Number, height: Number, flipY: Boolean }

  // array of pixel data for cubemaps (and array texture in webgl2)
  // opts = { data: [ { data: Array, width: Number, height: Number }, ..], flipY: Boolean }

  const img = opts.data ? opts.data : opts
  if (img && img.nodeName) {
    assert(img instanceof window.HTMLImageElement ||
      img instanceof window.HTMLCanvasElement,
      'Texture2D.update opts has to be Image, Canvas or Video element')
    // TODO: add support for HTMLVideoElement with videoWidth and videoHeight
    width = img.width
    height = img.height
    internalFormat = gl.RGBA
    format = gl.RGBA
    type = gl.UNSIGNED_BYTE
    gl.texImage2D(target, lod, internalFormat, format, type, img)
  } else if (typeof opts === 'object') {
    assert(!data || Array.isArray(opts.data) ||
      opts.data instanceof Uint8Array ||
      opts.data instanceof Float32Array,
      'Texture2D.update opts.data has to be null or an Array, Uint8Array or Float32Array')

    data = opts.data ? (opts.data.data || opts.data) : null

    assert((opts.width !== undefined) && (opts.height !== undefined),
      'Texture2D.update opts.width and opts.height are required when providing opts.data')

    width = opts.width
    height = opts.height

    if (pixelFormat === PixelFormat.Depth) {
      format = gl.DEPTH_COMPONENT
      internalFormat = gl.DEPTH_COMPONENT
      type = gl.UNSIGNED_SHORT
    } else if (pixelFormat === PixelFormat.RGBA8) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.UNSIGNED_BYTE
    } else if (pixelFormat === PixelFormat.RGBA32F) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.FLOAT
    } else if (pixelFormat === PixelFormat.RGBA16F) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.HALF_FLOAT
    } else if (pixelFormat === PixelFormat.R32F) {
      format = gl.ALPHA
      internalFormat = gl.ALPHA
      type = gl.FLOAT
    } else if (pixelFormat) {
      assert.fail(`Unknown texture pixel format: ${opts.format}`)
    }

    if (target === gl.TEXTURE_2D) {
      if (Array.isArray(data)) {
        if (type === gl.UNSIGNED_BYTE) {
          data = new Uint8Array(data)
        } else if (type === gl.FLOAT) {
          data = new Float32Array(data)
        } else if (type === gl.HALF_FLOAT) {
          data = new Float32Array(data)
        } else {
          assert.fail(`Unknown texture data type: ${type}`)
        }
      }
      gl.texImage2D(target, lod, internalFormat, width, height, 0, format, type, data)
    } else if (target === gl.TEXTURE_CUBE_MAP) {
      assert(!data || (Array.isArray(data) && data.length === 6), 'TextureCube requires data for 6 faces')
      for (let i = 0; i < 6; i++) {
        let faceData = data ? (data[i].data || data[i]) : null
        const faceTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i
        if (Array.isArray(faceData)) {
          if (type === gl.UNSIGNED_BYTE) {
            faceData = new Uint8Array(faceData)
          } else if (type === gl.FLOAT) {
            faceData = new Float32Array(data)
          } else {
            assert.fail(`Unknown texture data type: ${type}`)
          }
          gl.texImage2D(faceTarget, lod, internalFormat, width, height, 0, format, type, faceData)
        } else if (faceData && faceData.nodeName) {
          gl.texImage2D(faceTarget, lod, internalFormat, format, type, faceData)
        } else {
          gl.texImage2D(faceTarget, lod, internalFormat, width, height, 0, format, type, faceData)
        }
      }
    }
  } else {
    // TODO: should i assert of throw new Error(msg)?
    assert.fail('Texture2D.update opts has to be a HTMLElement or Object')
  }

  texture.target = target
  // texture.data = data
  texture.width = width
  texture.height = height
  texture.pixelFormat = pixelFormat
  texture.encoding = encoding
  texture.min = min
  texture.mag = mag
  texture.wrapS = wrapS
  texture.wrapT = wrapT
  texture.format = format
  texture.internalFormat = internalFormat
  texture.type = type
  texture.info = ''
  texture.info += Object.keys(ctx.PixelFormat).find((key) => ctx.PixelFormat[key] === pixelFormat)
  texture.info += '_'
  texture.info += Object.keys(ctx.Encoding).find((key) => ctx.Encoding[key] === encoding)

  return texture
}

module.exports = createTexture
