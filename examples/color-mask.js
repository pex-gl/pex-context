const createContext = require('../')

const ctx = createContext()

const baboon = require('baboon-image')
const baboonTex = ctx.texture2D({
  data: baboon.data,
  width: baboon.shape[0],
  height: baboon.shape[1],
  flipY: true
})

const quadPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const quadTexCoords = [[0, 0], [1, 0], [1, 1], [0, 1]]
const quadFaces = [[0, 1, 2], [0, 2, 3]]

const vert = /* glsl */ `
attribute vec2 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const frag = /* glsl */ `
precision mediump float;

uniform sampler2D uTexture;
varying vec2 vTexCoord;
void main () {
  gl_FragColor = texture2D(uTexture, vTexCoord);
}
`

const redPipeline = ctx.pipeline({
  vert: vert,
  frag: frag,
  colorMask: [true, false, false, true]
})

const greenPipeline = ctx.pipeline({
  vert: vert,
  frag: frag,
  colorMask: [false, true, false, true]
})

const bluePipeline = ctx.pipeline({
  vert: vert,
  frag: frag,
  colorMask: [false, false, true, true]
})

const drawTextureCmd = {
  name: 'drawTexture',
  pipeline: ctx.pipeline({
    vert: vert,
    frag: frag
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(quadPositions),
    aTexCoord: ctx.vertexBuffer(quadTexCoords)
  },
  indices: ctx.indexBuffer(quadFaces),
  uniforms: {
    uTexture: null
  }
}

const clearScreenCmd = {
  name: 'clearScreen',
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1]
  })
}

ctx.frame(() => {
  const w = ctx.gl.drawingBufferWidth
  const h = ctx.gl.drawingBufferHeight
  const size = Math.floor(w / 4)

  ctx.submit(clearScreenCmd)

  ctx.submit(drawTextureCmd, {
    viewport: [0, h * 0.5 - size * 0.5, size, size],
    pipeline: redPipeline,
    uniforms: {
      uTexture: baboonTex
    }
  })
  ctx.submit(drawTextureCmd, {
    viewport: [size, h * 0.5 - size * 0.5, size, size],
    pipeline: greenPipeline,
    uniforms: {
      uTexture: baboonTex
    }
  })
  ctx.submit(drawTextureCmd, {
    viewport: [size * 2, h * 0.5 - size * 0.5, size, size],
    pipeline: bluePipeline,
    uniforms: {
      uTexture: baboonTex
    }
  })
  ctx.submit(drawTextureCmd, {
    viewport: [size * 3, h * 0.5 - size * 0.5, size, size],
    uniforms: {
      uTexture: baboonTex
    }
  })
  window.dispatchEvent(new CustomEvent('pex-screenshot'))
})
