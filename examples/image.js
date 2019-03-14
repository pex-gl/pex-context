const createContext = require('../../pex-context')
const loadImage = require('pex-io/loadImage')
const raf = require('raf')
const isBrowser = require('is-browser')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

const ctx = createContext()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [2, 0.5, 2],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const ASSETS_DIR = isBrowser ? 'assets' : `${__dirname}/assets`

const cube = createCube(1)

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.5, 0.5, 0.5, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    vert: `
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uModelMatrix;

      varying vec2 vTexCoord;

      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision highp float;
      #endif
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      void main () {
        gl_FragColor = texture2D(uTexture, vTexCoord) * 0.7 + 0.3 * vec4(vTexCoord, 0.0, 1.0);
      }
    `,
    depthTest: true
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aTexCoord: ctx.vertexBuffer(cube.uvs)
  },
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  }
}

loadImage(ASSETS_DIR + '/images/pex.png', (err, img) => {
  if (err) throw err

  drawCmd.uniforms.uTexture = ctx.texture2D({
    data: img.data || img,
    width: img.width,
    height: img.height,
    flipY: true,
    pixelFormat: ctx.PixelFormat.RGBA8,
    encoding: ctx.Encoding.Linear
  })

  raf(function frame() {
    ctx.submit(drawCmd)
    raf(frame)
  })
})
