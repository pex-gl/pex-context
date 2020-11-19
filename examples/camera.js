const createContext = require('../')
const createCube = require('primitive-cube')
const createCamera = require('pex-cam/perspective')

const basicVert = require('./shaders/basic.vert.js')
const basicFrag = require('./shaders/basic.frag.js')

const ctx = createContext({
  pixelRatio: window.devicePixelRatio
})

const cube = createCube()
const camera = createCamera({
  position: [2, 2, 2],
  fov: Math.PI / 3,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
})

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
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
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix
  }
}

window.addEventListener('resize', () => {
  ctx.set({
    width: window.innerWidth,
    height: window.innerHeight
  })
  camera.set({
    aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
  })
})

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    }
  })
  window.dispatchEvent(new CustomEvent('pex-screenshot'))
})
