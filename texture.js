const assert = require('assert')
const checkProps = require('./check-props')

const allowedProps = [
  'name',
  'data',
  'width',
  'height',
  'pixelFormat',
  'internalFormat',
  'type',
  'encoding',
  'flipY',
  'mipmap',
  'target',
  'min',
  'mag',
  'wrap',
  'wrapS',
  'wrapT',
  'aniso',
  'premultiplyAlpha',
  'compressed'
]

function createTexture(ctx, opts) {
  checkProps(allowedProps, opts)

  const gl = ctx.gl

  const texture = {
    class: 'texture',
    handle: gl.createTexture(),
    target: opts.target,
    width: 0,
    height: 0,
    _update: updateTexture2D,
    _dispose: function() {
      gl.deleteTexture(this.handle)
      this.handle = null
    }
  }

  updateTexture2D(ctx, texture, opts)

  return texture
}

function orValue(a, b) {
  return a !== undefined ? a : b
}

// opts = { data, width, height, pixelFormat, encoding, flipY }
function updateTexture2D(ctx, texture, opts) {
  // checkProps(allowedProps, opts)

  const gl = ctx.gl
  let compressed = opts.compressed

  let data = null
  let width = opts.width
  let height = opts.height
  let lod = 0
  let flipY = orValue(opts.flipY, orValue(texture.flipY, false))
  let target = opts.target || texture.target
  let pixelFormat =
    opts.pixelFormat || texture.pixelFormat || ctx.PixelFormat.RGBA8
  let encoding = opts.encoding || texture.encoding || ctx.Encoding.Linear
  let min = opts.min || texture.min || gl.NEAREST
  let mag = opts.mag || texture.mag || gl.NEAREST
  let wrapS =
    opts.wrapS || opts.wrap || texture.wrapS || texture.wrap || gl.CLAMP_TO_EDGE
  let wrapT =
    opts.wrapT || opts.wrap || texture.wrapT || texture.wrap || gl.CLAMP_TO_EDGE
  let aniso = opts.aniso || texture.aniso || 0
  let premultiplyAlpha = orValue(
    opts.premultiplyAlpha,
    orValue(texture.premultiplyAlpha, false)
  )
  let internalFormat
  let type
  let format

  var anisoExt = gl.getExtension('EXT_texture_filter_anisotropic')

  const textureUnit = 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(texture.target, texture.handle)
  ctx.state.activeTextures[textureUnit] = texture

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiplyAlpha)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, mag)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, min)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT)
  if (anisoExt && aniso > 0) {
    gl.texParameterf(target, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, aniso)
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

  // array of pixel data for cubemaps and compressed texture (and array texture in webgl2)
  // opts = { data: [ { data: Array, width: Number, height: Number }, ..], flipY: Boolean }

  const img = opts.data ? opts.data : opts
  if (img && img.nodeName) {
    assert(
      img instanceof window.HTMLImageElement ||
        img instanceof window.HTMLVideoElement ||
        img instanceof window.HTMLCanvasElement,
      'Texture2D.update opts has to be Image, Canvas or Video element'
    )
    width = img.width || img.videoHeight
    height = img.height || img.videoHeight
    internalFormat = gl.RGBA
    format = gl.RGBA
    type = gl.UNSIGNED_BYTE
    gl.texImage2D(target, lod, internalFormat, format, type, img)
    texture.width = width
    texture.height = height
  } else if (typeof opts === 'object') {
    assert(
      !data ||
        Array.isArray(opts.data) ||
        opts.data instanceof Uint8Array ||
        opts.data instanceof Float32Array,
      'Texture2D.update opts.data has to be null or an Array, Uint8Array or Float32Array'
    )

    data = opts.data ? opts.data.data || opts.data : null

    if (!opts.width && data && data.width) width = data.width
    if (!opts.height && data && data.height) height = data.height

    if (!compressed) {
      assert(
        !data || (width !== undefined && height !== undefined),
        'Texture2D.update opts.width and opts.height are required when providing opts.data'
      )
    }

    // Get internalFormat (format the GPU use internally) from opts.internalFormat (mainly for compressed texture) or pixelFormat
    internalFormat = opts.internalFormat || gl[pixelFormat] || gl.RGBA
    assert(
      internalFormat,
      `Texture2D.update Unknown internalFormat ${internalFormat}.`
    )

    // Get actual format and type (data supplied)
    ;[format, type] = ctx.TextureFormat[pixelFormat]
    type = opts.type || type
    assert(type, `Texture2D.update Unknown type ${type}.`)

    // WEBGL_depth_texture (WebGL1 only) just adds DEPTH_COMPONENT and DEPTH_STENCIL
    if (
      ctx.capabilities.depthTexture &&
      ['DEPTH_COMPONENT16', 'DEPTH_COMPONENT24'].includes(pixelFormat)
    ) {
      internalFormat = gl['DEPTH_COMPONENT']
    }

    if (target === gl.TEXTURE_2D) {
      if (compressed) {
        data = Array.isArray(data) ? data : [data]

        for (let level = 0; level < data.length; level++) {
          assert(
            !data[level].data ||
              (data[level].width !== undefined &&
                data[level].height !== undefined),
            'Texture2D.update opts.width and opts.height are required when providing opts.data'
          )
          gl.compressedTexImage2D(
            target,
            level,
            internalFormat,
            data[level].width,
            data[level].height,
            0,
            data[level].data
          )
        }

        // Set filtering
        // TODO: allow override?
        if (data.length > 1) {
          if (texture.min === gl.LINEAR) texture.min = gl.NEAREST_MIPMAP_LINEAR
        } else {
          if (texture.min === gl.NEAREST_MIPMAP_LINEAR) texture.min = gl.LINEAR
        }

        texture.width = data[0].width
        texture.height = data[0].height
      } else {
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

        if (width && height) {
          gl.texImage2D(
            target,
            lod,
            internalFormat,
            width,
            height,
            0,
            format,
            type,
            data
          )
          texture.width = width
          texture.height = height
        }
      }
    } else if (target === gl.TEXTURE_CUBE_MAP) {
      assert(
        !data || (Array.isArray(data) && data.length === 6),
        'TextureCube requires data for 6 faces'
      )
      // TODO: gl.compressedTexImage2D for cubemap target
      for (let i = 0; i < 6; i++) {
        let faceData = data ? data[i].data || data[i] : null
        const faceTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i
        if (Array.isArray(faceData)) {
          if (type === gl.UNSIGNED_BYTE) {
            faceData = new Uint8Array(faceData)
          } else if (type === gl.FLOAT) {
            faceData = new Float32Array(data)
          } else {
            assert.fail(`Unknown texture data type: ${type}`)
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
            faceData
          )
        } else if (faceData && faceData.nodeName) {
          gl.texImage2D(faceTarget, lod, internalFormat, format, type, faceData)
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
            faceData
          )
        }
        texture.width = width
        texture.height = height
      }
    }
  } else {
    // TODO: should i assert of throw new Error(msg)?
    assert.fail('Texture2D.update opts has to be a HTMLElement or Object')
  }

  if (opts.mipmap) {
    gl.generateMipmap(texture.target)
  }

  texture.target = target
  texture.pixelFormat = pixelFormat
  texture.encoding = encoding
  texture.min = min
  texture.mag = mag
  texture.wrapS = wrapS
  texture.wrapT = wrapT
  texture.format = format
  texture.flipY = flipY
  texture.internalFormat = internalFormat
  texture.type = type
  texture.info = ''
  texture.info += Object.keys(ctx.PixelFormat).find(
    (key) => ctx.PixelFormat[key] === pixelFormat
  )
  texture.info += '_'
  texture.info += Object.keys(ctx.Encoding).find(
    (key) => ctx.Encoding[key] === encoding
  )

  return texture
}

module.exports = createTexture
