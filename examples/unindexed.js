const createContext = require('../')
const createCube = require('primitive-cube')
const splitVertices = require('geom-split-vertices')
const normals = require('geom-normals')
const random = require('pex-random')
const GUI = require('pex-gui')

const ctx = createContext({})

const W = window.innerWidth
const H = window.innerHeight
const halfW = Math.floor(W / 2)
const halfH = Math.floor(H / 2)

const gui = new GUI(ctx)
gui.addHeader('Indexed').setPosition(10, 10)
gui.addHeader('Unndexed').setPosition(W / 2 + 10, 10)
gui.addHeader('Indexed instanced').setPosition(10, H / 2 + 10)
gui.addHeader('Unindexed instanced').setPosition(W / 2 + 10, H / 2 + 10)

const camera = require('pex-cam/perspective')({
  aspect: W / H,
  fov: Math.PI / 3,
  position: [2, 1, 2]
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
    vert: /* glsl */ `
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
    frag: /* glsl */ `
      precision mediump float;

      varying vec3 vNormal;
      void main () {
        gl_FragColor.rgb = vNormal * 0.5 + 0.5;
        gl_FragColor.a = 1.0;
      }
    `
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix
  }
}

const drawInstancedCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: /* glsl */ `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      attribute vec3 aOffset;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      varying vec3 vNormal;
      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition + aOffset, 1.0);
        vNormal = aNormal;
      }
    `,
    frag: /* glsl */ `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec3 vNormal;
      void main () {
        gl_FragColor.rgb = vNormal * 0.5 + 0.5;
        gl_FragColor.a = 1.0;
      }
    `
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix
  }
}

const cube = createCube()
const indexedPositions = ctx.vertexBuffer(cube.positions)
const indexedNormals = ctx.vertexBuffer(cube.normals)
const indices = ctx.indexBuffer(cube.cells)

const unindexedCube = splitVertices(cube)
unindexedCube.normals = normals(unindexedCube.positions, unindexedCube.cells)
const unindexedPositions = ctx.vertexBuffer(unindexedCube.positions)
const unindexedNormals = ctx.vertexBuffer(unindexedCube.normals)

const offsetPositions = new Array(20).fill(0).map(() => random.vec3(0.5))
const offsets = ctx.vertexBuffer(offsetPositions)

ctx.frame(() => {
  ctx.submit(clearCmd)

  // indexed
  ctx.submit(drawCmd, {
    viewport: [0, halfH, halfW, halfH],
    scissor: [0, halfH, halfW, halfH],
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals
    },
    indices: indices
  })

  // unindexed
  ctx.submit(drawCmd, {
    viewport: [halfW, halfH, halfW, halfH],
    scissor: [halfW, halfH, halfW, halfH],
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals
    },
    count: unindexedCube.positions.length
  })

  // indexed instanced
  ctx.submit(drawInstancedCmd, {
    viewport: [0, 0, halfW, halfH],
    scissor: [0, 0, halfW, halfH],
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals,
      aOffset: { buffer: offsets, divisor: 1 }
    },
    indices: indices,
    instances: offsetPositions.length
  })

  // unindexed instanced
  ctx.submit(drawInstancedCmd, {
    viewport: [halfW, 0, halfW, halfH],
    scissor: [halfW, 0, halfW, halfH],
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals,
      aOffset: { buffer: offsets, divisor: 1 }
    },
    count: unindexedCube.positions.length,
    instances: offsetPositions.length
  })

  window.dispatchEvent(new CustomEvent('pex-screenshot'))

  gui.draw()
})
