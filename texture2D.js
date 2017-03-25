const assert = require('assert')
const isPlask = require('is-plask')

// Flipping array buffer in place
function flipImageData (data, width, height) {
  const numComponents = data.length / (width * height)
  for (let y = 0; y < height / 2; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < numComponents; c++) {
        const i = (y * width + x) * numComponents + c
        const flippedI = ((height - y - 1) * width + x) * numComponents + c
        const tmp = data[i]
        data[i] = data[flippedI]
        data[flippedI] = tmp
      }
    }
  }
}

function createTexture2D (ctx, opts) {
  const gl = ctx.gl

  // TODO: implement filtering options

  const texture = {
    class: 'texture2D',
    handle: gl.createTexture(),
    target: gl.TEXTURE_2D,
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
  let flipY = true

  gl.getExtension('WEBGL_depth_texture')

  const textureUnit = 0
  gl.activeTexture(gl.TEXTURE0 + textureUnit)
  gl.bindTexture(texture.target, texture.handle)
  // TODO: push state (current texture binding)

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  if (opts.src) {
    assert(opts instanceof window.HTMLImageElement
      || opts instanceof window.HTMLCanvasElement,
      'Texture2D.update opts has to be Image, Canvas or Video element')
    // TODO: add support for HTMLVideoElement with videoWidth and videoHeight
    data = opts
    width = opts.width
    height = opts.height
    gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, format, type, gl.UNSIGNED_BYTE, data)
  } else if (typeof opts === 'object') {
    assert(!data || Array.isArray(opts.data)
      || opts.data instanceof Uint8Array
      || opts.data instanceof Float32Array,
      'Texture2D.update opts.data has to be null or an Array, Uint8Array or Float32Array')

    data = opts.data

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
    }

    if (!data) {
      gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, type, null)
    } else if (isPlask) {
      // TODO: test and benchrmark texture flipping in Plask
      if (flipY) {
        flipImageData(data, width, height)
      }
      gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, type, data)
      if (flipY) {
        // unflip it
        flipImageData(data, width, height)
      }
    } else {
      gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, type, data)
    }
  } else {
    // TODO: should i assert of throw new Error(msg)?
    assert.fail('Texture2D.update opts has to be a HTMLElement or Object')
  }

    // && (!opts.data || ) && opts.width && opts.height) {
    // if (opts.format) {
    // } else if (opts.type) {
      // throw new Error(`Texture2D type not supported. Use format:PixelFormat instead`)
    // }
    // const res = this.ctx.createTexture2D(opts.data, opts.width, opts.height, opts)
    // res.id = 'texture2D_' + ID++
    // this.resources.push(res)
    // return res
  // } else {
    // throw new Error('Invalid parameters. Object { data: Uint8Array/Float32Array, width: Int, height: Int, [format: Enum ]} required.')
  // }

  texture.width = width
  texture.height = height
  texture.format = format
  texture.internalFormat = internalFormat
  texture.type = type
  return texture
}

module.exports = createTexture2D
