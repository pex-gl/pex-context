const createContext = require('../')
const createCube = require('primitive-cube')
const { vec3, mat4 } = require('pex-math')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')

const ctx = createContext({
  stencil: true
})

console.log(ctx.capabilities)

const cube = createCube()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: window.innerWidth / window.innerHeight,
  position: [5, 5, 5],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

createOrbiter({ camera: camera, distance: 10 })

const N = 64
const colors = []
const offsets = []

const s = 2
for (var i = 0; i < N; i++) {
  colors.push([Math.random(), Math.random(), Math.random(), 1.0])
  offsets.push([
    Math.random() * 2 * s - s,
    Math.random() * 2 * s - s,
    Math.random() * 2 * s - s
  ])
}

let W = window.innerWidth
let H = window.innerHeight
const colorTex = ctx.texture2D({ width: W, height: H })
let depthTex = null
let depthRenderbuffer = null
let useDepthTexture = false
if (ctx.capabilities.depthTexture && useDepthTexture) {
  depthTex = ctx.texture2D({
    width: W,
    height: H,
    pixelFormat: ctx.PixelFormat.Depth
  })
} else {
  depthRenderbuffer = ctx.renderbuffer({
    width: W,
    height: H,
    pixelFormat: ctx.PixelFormat.Depth16
  })
}

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aOffset;
      attribute vec3 aNormal;
      attribute vec4 aColor;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      varying vec3 vNormal;
      varying vec4 vColor;
      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition + aOffset, 1.0);
        vNormal = aNormal;
        vColor = aColor;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec3 vNormal;
      varying vec4 vColor;
      uniform vec4 uHitColor;
      uniform bool uRenderColors;

      void main () {
        vec3 N = normalize(vNormal);
        vec3 L = normalize(vec3(1.0, 2.0, 3.0)); 
        float dotNL = abs(dot(N, L));
        float diffuse = (dotNL + 1.0) / 2.0;
        if (uRenderColors) {
          gl_FragColor.rgba = vColor;
        } else {
          gl_FragColor.rgba = vec4(diffuse, diffuse, diffuse, 1.0);
          if (distance(uHitColor, vColor) < 1.0/255.0) {
            gl_FragColor.rgb *= vec3(1.0, 0.3, 0.3);
          }
        }
      }
    `
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals),
    aOffset: { buffer: ctx.vertexBuffer(offsets), divisor: 1 },
    aColor: { buffer: ctx.vertexBuffer(colors), divisor: 1 }
  },
  instances: N,
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    ),
    uViewMatrix: null,
    uHitColor: [0, 0, 0, 1]
  }
}

let mx
let my
let px
let py
const pixels = new Uint8Array(4)
let hitColor = [0, 0, 0, 0]

const renderToTextureWrap = {
  pass: ctx.pass({
    color: [colorTex],
    clearColor: [0, 0, 0, 1],
    depth: depthRenderbuffer || depthTex,
    clearDepth: 1
  })
}

const readPixelWrap = {
  pass: ctx.pass({
    color: [colorTex]
  })
}

function onCanvasMove(e) {
  mx = e.offsetX
  my = e.offsetY
}
ctx.gl.canvas.addEventListener('mousemove', onCanvasMove)

const drawPreviewCmd = {
  pipeline: ctx.pipeline({
    vert: `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main () {
        vec2 pos = aPosition;
        pos = (pos + vec2(1.0)) / vec2(2.0);
        pos *= 0.3;
        pos *= 2.0;
        pos -= 1.0;
        gl_Position = vec4(pos, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      varying vec2 vTexCoord;
      uniform sampler2D uColorTex;

      void main () {
        gl_FragColor = texture2D(uColorTex, vTexCoord);
      }
    `
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([-1, -1, 1, -1, 1, 1, -1, 1]),
    aTexCoord: ctx.vertexBuffer([0, 0, 1, 0, 1, 1, 0, 1])
  },
  indices: ctx.indexBuffer([[0, 1, 2], [0, 2, 3]]),
  uniforms: {
    uColorTex: colorTex
  }
}

let debugNextFrame = false
window.addEventListener('keypress', () => {
  debugNextFrame = true
})

window.addEventListener('resize', () => {
  W = window.innerWidth
  H = window.innerHeight
  ctx.set({ width: W, height: H })
  ctx.update(colorTex, { width: W, height: H })
  ctx.update(depthRenderbuffer, { width: W, height: H })
  drawCmd.uniforms.uProjectionMatrix = mat4.perspective(
    mat4.create(),
    Math.PI / 4,
    W / H,
    0.1,
    100
  )
})

ctx.frame(() => {
  if (debugNextFrame) ctx.debug(true)
  ctx.submit(clearCmd)
  ctx.submit(renderToTextureWrap, () => {
    ctx.submit(drawCmd, {
      uniforms: {
        uViewMatrix: camera.viewMatrix,
        uRenderColors: true
      }
    })
  })

  if (px !== mx || py !== my) {
    px = mx
    py = my
    ctx.submit(readPixelWrap, () => {
      ctx.gl.readPixels(
        mx,
        H - my,
        1,
        1,
        ctx.gl.RGBA,
        ctx.gl.UNSIGNED_BYTE,
        pixels
      )
    })
    var selectedColor = [pixels[0] / 255, pixels[1] / 255, pixels[2] / 255]
    var color = colors.find(c => vec3.distance(c, selectedColor) < 1 / 255)
    var index = colors.indexOf(color)
    if (index !== -1) {
      hitColor = color
    } else {
      hitColor = [0, 0, 0, 0]
    }
  }
  ctx.submit(drawCmd, {
    uniforms: {
      uViewMatrix: camera.viewMatrix,
      uRenderColors: false,
      uHitColor: hitColor
    }
  })
  ctx.submit(drawPreviewCmd)
  if (debugNextFrame) {
    ctx.debug(false)
    debugNextFrame = false
  }
})
