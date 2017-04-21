const assert = require('assert')

function createTexture2D (ctx, opts) {
  const gl = ctx.gl

  // TODO: implement filtering options

  const texture = {
    class: 'texture2D',
    handle: gl.createTexture(),
    target: opts.target,
    width: 0,
    height: 0,
    _update: updateTexture2D
  }

  updateTexture2D(ctx, texture, opts)

  return texture
}

// opts = { src, width, height }
// opts = { data, width, height, format, flipY }
function updateTexture2D (ctx, texture, opts) {
  const gl = ctx.gl
  const PixelFormat = ctx.PixelFormat

  let data = null
  let width = 0
  let height = 0
  let lod = 0
  let internalFormat = gl.RGBA
  let format = gl.RGBA
  let type = gl.UNSIGNED_BYTE
  let flipY = opts.flipY || false
  let target = opts.target || texture.target

  gl.getExtension('WEBGL_depth_texture')
  gl.getExtension('EXT_shader_texture_lod')
  gl.getExtension('OES_texture_float')
  gl.getExtension('OES_texture_float_linear')
  gl.getExtension('OES_texture_half_float')
  gl.getExtension('OES_texture_half_float_linear')

  const textureUnit = 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(texture.target, texture.handle)
  // TODO: push state (current texture binding)

  if (opts.mipmap) {
    if (opts.data || opts.width || opts.height) {
      throw new Error('Updating and generating mipmaps at the same time is currently not supported')
    }
    gl.generateMipmap(texture.target)
    return
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, opts.min || gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, opts.mag || gl.NEAREST)
  gl.texParameteri(target, gl.TEXTURE_WRAP_S, opts.wrap || gl.CLAMP_TO_EDGE)
  gl.texParameteri(target, gl.TEXTURE_WRAP_T, opts.wrap || gl.CLAMP_TO_EDGE)


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
    gl.texImage2D(target, lod, internalFormat, format, type, img)
  } else if (typeof opts === 'object') {
    assert(!data || Array.isArray(opts.data) ||
      opts.data instanceof Uint8Array ||
      opts.data instanceof Float32Array,
      'Texture2D.update opts.data has to be null or an Array, Uint8Array or Float32Array')

    data = opts.data ? (opts.data.data || opts.data) : null

    assert(opts.width && opts.height,
      'Texture2D.update opts.width and opts.height are required when providing opts.data')

    width = opts.width
    height = opts.height

    if (opts.format === PixelFormat.Depth) {
      format = gl.DEPTH_COMPONENT
      internalFormat = gl.DEPTH_COMPONENT
      type = gl.UNSIGNED_SHORT
    } else if (opts.format === PixelFormat.RGBA32F) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.FLOAT
    } else if (opts.format === PixelFormat.RGBA16F) {
      format = gl.RGBA
      internalFormat = gl.RGBA
      type = gl.HALF_FLOAT
    } else if (opts.format === PixelFormat.R32F) {
      format = gl.ALPHA
      internalFormat = gl.ALPHA
      type = gl.FLOAT
    } else if (opts.format) {
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
  texture.data = data
  texture.width = width
  texture.height = height
  texture.format = format
  texture.internalFormat = internalFormat
  texture.type = type
  return texture
}

module.exports = createTexture2D
