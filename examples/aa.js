const createContext = require('../')
const io = require('pex-io')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const canvasScreenshot = require('canvas-screenshot')
const mat4 = require('pex-math/mat4')
const GUI = require('pex-gui')
const createCube = require('primitive-cube')
const createPlane = require('primitive-plane')
const glsl = require('glslify')

// Tests
// [X] antialias
// [X] SAMPLE_ALPHA_TO_COVERAGE
// [X] FXAA
// [ ] SMAA
// [ ] MSAA
// [ ] TAA

// Setup context
const ctx = createContext({ antialias: true, alpha: false })

// ctx.gl.canvas.style.backgroundColor = '#f00'

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  near: 0.1,
  far: 10,
  position: [0, 0, 0.7]
  // position: [0, 0, 0.2]
})
createOrbiter({ camera })

// Commands
const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 1, 0, 1],
    clearDepth: 1
  })
}

// const geometry = createPlane()
const geometry = createCube()

const vert = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord0;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;

varying vec3 vNormal;
varying vec2 vTexCoord0;

void main() {
  vNormal = aNormal;
  vTexCoord0 = aTexCoord0;
  mat4 modelViewMatrix = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);
}
`

const frag = glsl`
#ifdef GL_ES
precision highp float;
#endif

#pragma glslify: fxaa = require(glsl-fxaa)

varying vec3 vNormal;
varying vec2 vTexCoord0;

uniform vec2 uResolution;
uniform sampler2D uBaseColorMap;
uniform bool uFXAAEnabled;

void main() {
  vec2 fragCoord = vTexCoord0 * uResolution;
  vec4 texelColor = texture2D(uBaseColorMap, vTexCoord0);

  gl_FragColor = texelColor;

  // FXAA
  if (uFXAAEnabled) gl_FragColor = fxaa(uBaseColorMap, fragCoord, uResolution);
}
`

const drawCmd = {
  // pass: ctx.pass({
  //   clearColor: [0, 0, 1, 1],
  //   clearDepth: 1
  // }),
  pipeline: ctx.pipeline({
    vert,
    frag,
    depthTest: true,
    cullFace: true,
    // blend: true,
    // blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    // blendSrcAlphaFactor: ctx.BlendFactor.One,
    // blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    // blendDstAlphaFactor: ctx.BlendFactor.One,
    primitive: ctx.Primitive.Triangles
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geometry.positions),
    aNormal: ctx.vertexBuffer(geometry.normals),
    aTexCoord0: ctx.vertexBuffer(geometry.uvs)
  },
  indices: ctx.indexBuffer(geometry.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uResolution: [ctx.gl.canvas.width, ctx.gl.canvas.height],
    uBaseColorMap: null,
    uFXAAEnabled: false
  }
}

// GUI
const STATE = {
  fxaa: false,
  sampleAlphaToCoverage: false,
  sampleA2CValue: 1.0,
  baseColorMap: false,
  screenshotFlag: false
}

const gui = new GUI(ctx)
gui.addHeader('Settings')
gui.addButton('Screenshot', () => (STATE.screenshotFlag = true))
gui.addParam('A2C', STATE, 'sampleAlphaToCoverage', {}, () => {
  if (STATE.sampleAlphaToCoverage) {
    ctx.gl.enable(ctx.gl.SAMPLE_ALPHA_TO_COVERAGE)
    ctx.gl.sampleCoverage(1, false)
  } else {
    ctx.gl.disable(ctx.gl.SAMPLE_ALPHA_TO_COVERAGE)
  }
})
gui.addParam('A2C value', STATE, 'sampleA2CValue', { min: 0, max: 1, step: 0.5 }, () => {
  if (STATE.sampleAlphaToCoverage) ctx.gl.sampleCoverage(STATE.sampleA2CValue, false)
})
gui.addParam('FXAA', STATE, 'fxaa', {}, () => {
  drawCmd.uniforms.uFXAAEnabled = STATE.fxaa
})

// Load textures
Promise.all([
  io.loadImage('assets/images/diffuse.png'),
  io.loadImage('assets/images/checker.png'),
  io.loadImage('assets/images/checker.jpg')
]).then((images) => {
  const textures = images.map((image) =>
    ctx.texture2D({
      data: image,
      width: image.width,
      height: image.height,
      pixelFormat: ctx.PixelFormat.RGBA8,
      encoding: ctx.Encoding.SRGB,
      min: ctx.Filter.Linear,
      mag: ctx.Filter.Linear,
      wrap: ctx.Wrap.Repeat,
      flipY: true
      // min: ctx.Filter.LinearMipmapLinear,
      // mipmap: true,
    })
  )
  drawCmd.uniforms.uBaseColorMap = STATE.baseColorMap = textures[0]

  gui.addTexture2DList('Base Color Map', STATE, 'baseColorMap', textures, 2, () => {
    drawCmd.uniforms.uBaseColorMap = STATE.baseColorMap
  })

  // Frame
  ctx.frame(() => {
    ctx.submit(clearCmd)
    ctx.submit(drawCmd)

    gui.draw()

    if (STATE.screenshotFlag) {
      STATE.screenshotFlag = false
      canvasScreenshot(ctx.gl.canvas)
    }
  })
})

// Events
window.addEventListener('resize', () => {
  const W = window.innerWidth
  const H = window.innerHeight

  ctx.set({
    width: W,
    height: H
  })
  camera.set({
    aspect: W / H
  })

  drawCmd.uniforms.uResolution = [W, H]
})
