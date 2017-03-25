const assert = require('assert')
const createContext = require('../../pex-context')
const ctx = createContext()

const tex = ctx.texture2D({ data: new Uint8Array([0, 0, 0, 0]), width: 1, height: 1 })
assert.equal(tex.type, ctx.DataType.Uint8)
assert.equal(tex.class, 'texture2D', 'Wrong texture2D class')

const vertexBuffers = [
  ctx.vertexBuffer([0, 1, 2, 3, 4, 5]),
  ctx.vertexBuffer([[0, 1, 2], [3, 4, 5]]),
  ctx.vertexBuffer(new Float32Array([0, 1, 2, 3, 4, 5])),
  ctx.vertexBuffer({ data: [0, 1, 2, 3, 4, 5] }),
  ctx.vertexBuffer({ data: [[0, 1, 2], [3, 4, 5]]}),
  ctx.vertexBuffer({ data: new Float32Array([0, 1, 2, 3, 4, 5]) })
]

vertexBuffers.forEach((vertexBuffer, i) => {
  assert.equal(vertexBuffer.target, ctx.gl.ARRAY_BUFFER, `VertexBuffer ${i} type is wrong ${vertexBuffer.target} != ${ctx.gl.ARRAY_BUFFER}`)
  assert.equal(vertexBuffer.data[3], 3, `VertexBuffer ${i} data is wrong ${vertexBuffer.data[3]} != 3`)
})

ctx.submit({
  attributes: {
    aPosition0: [0, 1, 0],
    aPosition2: [[0, 1, 0]],
    aPosition3: ctx.vertexBuffer([0, 1, 0]),
    aPosition4: { buffer: ctx.vertexBuffer([0, 1, 0]) }
  }
})
