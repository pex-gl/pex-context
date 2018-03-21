const createContext = require('../')
const createCube = require('primitive-cube')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')

const ctx = createContext({
  pixelRatio: window.devicePixelRatio
})

const cube = createCube()
const camera = createCamera({
  position: [2, 2, 2],
  fov: Math.PI / 3,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
})

const orbiter = createOrbiter({
  camera: camera,
  easing: 0.1
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
        gl_FragColor.rgb = vNormal * 0.5 + 0.5;
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
})
