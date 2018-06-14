const checkProps = require('./check-props')
const assert = require('assert')

const allowedProps = [
  'target', 'data', 'usage'
]

function createBuffer (ctx, opts) {
  const gl = ctx.gl
  checkProps(allowedProps, opts)
  assert(opts.target === gl.ARRAY_BUFFER || opts.target === gl.ELEMENT_ARRAY_BUFFER, 'Invalid buffer target')

  let className = (opts.target === gl.ARRAY_BUFFER) ? 'vertexBuffer' : 'indexBuffer'

  const buffer = {
    class: className,
    handle: gl.createBuffer(),
    target: opts.target,
    usage: opts.usage || gl.STATIC_DRAW,
    _update: updateBuffer,
    _dispose: function () {
      gl.deleteBuffer(this.handle)
      this.handle = null
    }
  }

  updateBuffer(ctx, buffer, opts)

  return buffer
}

function updateBuffer (ctx, buffer, opts) {
  checkProps(allowedProps, opts)

  const gl = ctx.gl
  let data = opts.data || opts
  let type = opts.type || buffer.type

  if (Array.isArray(data)) {
    var sourceData = data
    var elemSize = Array.isArray(sourceData[0]) ? sourceData[0].length : 1
    var size = elemSize * sourceData.length
    if (!type) {
      if (opts.target === gl.ARRAY_BUFFER) type = ctx.DataType.Float32
      else if (opts.target === gl.ELEMENT_ARRAY_BUFFER) type = ctx.DataType.Uint16
      else throw new Error('Missing buffer type')
    }
    if (type === ctx.DataType.Float32) data = new Float32Array((elemSize === 1) ? sourceData : size)
    else if (type === ctx.DataType.Uint16) data = new Uint16Array((elemSize === 1) ? sourceData : size)
    else throw new Error(`Unknown buffer type: ${type}`)

    if (elemSize > 1) {
      for (var i = 0; i < sourceData.length; i++) {
        for (var j = 0; j < elemSize; j++) {
          var index = i * elemSize + j
          data[index] = sourceData[i][j]
        }
      }
    }
  } else if (data instanceof ArrayBuffer) {
    if (!type) {
      if (opts.target === gl.ARRAY_BUFFER) type = ctx.DataType.Float32
      else if (opts.target === gl.ELEMENT_ARRAY_BUFFER) type = ctx.DataType.Uint16
      else throw new Error('Missing buffer type')
    }
    if (type === ctx.DataType.Float32) data = new Float32Array(data)
    else if (type === ctx.DataType.Uint16) data = new Uint16Array(data)
    else if (type === ctx.DataType.Uint32) data = new Uint32Array(data)
    else throw new Error(`Unknown buffer type: ${type}`)
  } else {
    if (data instanceof Float32Array) type = ctx.DataType.Float32
    else if (data instanceof Uint16Array) type = ctx.DataType.Uint16
    else if (data instanceof Uint32Array) type = ctx.DataType.Uint32
    else throw new Error(`Unknown buffer data type: ${data.constructor}`)
  }

  buffer.type = type
  buffer.length = data.length

  // TODO: push state, and pop as this can modify existing VBO?
  gl.bindBuffer(buffer.target, buffer.handle)
  gl.bufferData(buffer.target, data, buffer.usage)
}

module.exports = createBuffer
