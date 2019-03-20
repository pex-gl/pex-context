const createContext = require('../../pex-context')
const load = require('pex-io/load')
const raf = require('raf')
const isBrowser = require('is-browser')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const createSphere = require('primitive-sphere')
const mat4 = require('pex-math/mat4')
const GUI = require('pex-gui')

const skyboxVert = require('./shaders/skybox.vert')
const skyboxFrag = require('./shaders/skybox.frag')
const reflectionVert = require('./shaders/reflection.vert')
const reflectionFrag = require('./shaders/reflection.frag')

const ctx = createContext()
const gui = new GUI(ctx)

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [0, 0.5, 3],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const ASSETS_DIR = isBrowser ? '/assets' : `${__dirname}/assets`

const clearScreenCmd = {
  pass: ctx.pass({
    clearColor: [0.5, 0.5, 0.5, 1],
    clearDepth: 1
  })
}

const sphere = createSphere()

const drawCmd = {
  pipeline: ctx.pipeline({
    vert: reflectionVert,
    frag: reflectionFrag,
    depthTest: true
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(sphere.positions),
    aNormal: ctx.vertexBuffer(sphere.normals)
  },
  indices: ctx.indexBuffer(sphere.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  }
}

const skyboxPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const skyboxFaces = [[0, 1, 2], [0, 2, 3]]

const drawSkybox = {
  pipeline: ctx.pipeline({
    vert: skyboxVert,
    frag: skyboxFrag
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uEnvMap: null
  },
  attributes: {
    aPosition: ctx.vertexBuffer(skyboxPositions)
  },
  indices: ctx.indexBuffer(skyboxFaces)
}

const resources = {
  negx: { image: `${ASSETS_DIR}/images/pisa/pisa_negx.jpg` },
  negy: { image: `${ASSETS_DIR}/images/pisa/pisa_negy.jpg` },
  negz: { image: `${ASSETS_DIR}/images/pisa/pisa_negz.jpg` },
  posx: { image: `${ASSETS_DIR}/images/pisa/pisa_posx.jpg` },
  posy: { image: `${ASSETS_DIR}/images/pisa/pisa_posy.jpg` },
  posz: { image: `${ASSETS_DIR}/images/pisa/pisa_posz.jpg` }
}

load(resources, (err, res) => {
  if (err) throw err

  const envMapCube = ctx.textureCube({
    data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
    width: res.negx.width,
    height: res.negy.height,
    encoding: ctx.Encoding.SRGB
  })

  gui.addTextureCube('Cubemap', envMapCube, { flipEnvMap: -1 })

  drawSkybox.uniforms.uEnvMap = envMapCube
  drawCmd.uniforms.uEnvMap = envMapCube
  drawCmd.uniforms.uCameraPosition = camera.position

  raf(function frame() {
    ctx.submit(clearScreenCmd)
    ctx.submit(drawSkybox)
    ctx.submit(drawCmd)

    gui.draw()
    raf(frame)
  })
})
