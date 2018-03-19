const createContext = require('../')
const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

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
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      varying vec3 vNormal;
      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
        vNormal = aNormal;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec3 vNormal;
      void main () {
        gl_FragColor.rgb = vNormal;
        gl_FragColor.a = 1.0;
      }
    `
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals)
  },
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: mat4.perspective(mat4.create(), Math.PI / 4, W / H, 0.1, 100),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd)
})
