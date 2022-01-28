const createContext = require('../')
const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

const basicVert = require('./shaders/basic.vert.js')
const basicFrag = require('./shaders/basic.frag.js')

const W = 640
const H = 480
const ctx = createContext({ width: W, height: H })
const cube = createCube()

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.1, 0.1, 0.1, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicVert,
    frag: basicFrag
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals)
  },
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      W / H,
      0.1,
      100
    ),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd)
  window.dispatchEvent(new CustomEvent('pex-screenshot'))
})
