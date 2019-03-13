const createContext = require('../')
const createCube = require('primitive-cube')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const GUI = require('pex-gui')
const loadImage = require('pex-io/loadImage')
const isBrowser = require('is-browser')

const resolutions = [
  {
    name: '800x600 (low-res)',
    value: '800x600-lowres',
    width: 800,
    height: 600,
    pixelRatio: 0.5
  },
  { name: '800x600', value: '800x600', width: 800, height: 600, pixelRatio: 1 },
  {
    name: '800x600 (hi-res)',
    value: '800x600-hi-res',
    width: 800,
    height: 600,
    pixelRatio: 2
  },
  {
    name: 'Full window (low res)',
    value: 'full-window-lowres',
    width: 0,
    height: 0,
    pixelRatio: 0.5
  },
  {
    name: 'Full window',
    value: 'full-window',
    width: 0,
    height: 0,
    pixelRatio: 1
  },
  {
    name: 'Full window (hi-res)',
    value: 'full-window-hi-res',
    width: 0,
    height: 0,
    pixelRatio: 2
  }
]

const config = {
  pixelRatio: 1,
  antialias: false
}

const settings = {
  resolution: 'full-window',
  fov: Math.PI / 3,
  fullscreen: false
}

if (isBrowser && document.location.hash) {
  const resId = document.location.hash.substr(1)
  const res = resolutions.find(res => res.value === resId)
  if (res) {
    config.width = res.width
    config.height = res.height
    config.pixelRatio = res.pixelRatio
    settings.resolution = resId
  }
}

window.addEventListener('resize', () => {
  if (settings.resolution.includes('full-window')) {
    ctx.set({ width: window.innerWidth, height: window.innerHeight })
    camera.set({ aspect: window.innerWidth / window.innerHeight })
  }
})

const ctx = createContext(config)

function onFullscreenChange(e) {
  console.log(e)
  settings.fullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
}

if (isBrowser) {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)
  document.addEventListener('mozfullscreenchange', onFullscreenChange)
}

function requestFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen()
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen()
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  }
}

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

const assets = isBrowser ? 'assets' : __dirname + '/assets'

const tex = ctx.texture2D({ width: 1, height: 1 })
loadImage(assets + '/images/pex.png', (err, img) => {
  if (err) console.log(err)
  ctx.update(tex, { data: img, width: img.width, height: img.height })
})

const gui = new GUI(ctx)
gui.addHeader('Settings')
const fovItem = gui.addParam('FOV', settings, 'fov', {
  min: Math.PI / 4,
  max: Math.PI / 2
})
gui.addHeader('Resolution')
gui.addRadioList('Resolution', settings, 'resolution', resolutions, e => {
  const res = resolutions.find(r => r.value === settings.resolution)
  const w = res.width || window.innerWidth
  const h = res.height || window.innerHeight

  if (document && document.location) {
    document.location.hash = res.value
  }
  ctx.set({
    width: w,
    height: h,
    pixelRatio: res.pixelRatio
  })
  camera.set({ aspect: w / h })
})
gui.addTexture2D('PEX', tex)
gui.addHeader('Fullscreen')
gui.addParam('Fullscreen', settings, 'fullscreen', {}, e => {
  if (!settings.fullscreen) {
    exitFullscreen()
  } else {
    requestFullscreen(ctx.gl.canvas)
  }
})

setTimeout(() => {
  return
  settings.resolution = '800x600-hi-res'
  ctx.set({
    width: 800,
    height: 600,
    pixelRatio: 2
  })
  camera.set({ aspect: 800 / 600 })
}, 500)

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

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    }
  })

  gui.draw()
})
