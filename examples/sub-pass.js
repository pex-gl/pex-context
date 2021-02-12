const createContext = require('..')
const createCube = require('primitive-cube')
const createTorus = require('primitive-torus')
const mat4 = require('pex-math/mat4')

const raf = require('raf')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')

const diffuseVert = require('./shaders/diffuse.vert')
const diffuseFrag = require('./shaders/diffuse.frag')
const texturedVert = require('./shaders/textured.vert')
const texturedFrag = require('./shaders/textured.frag')

const screenImageVert = require('./shaders/screen-image.vert')
const screenImageFrag = require('./shaders/screen-image.frag')

const ctx = createContext()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [2, 2, 2],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

const halfSquareCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1 / 2,
  position: [3, 3, 3],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

const fullSquareCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [0, 0, 5],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

createOrbiter({ camera: camera, distance: 3 })
createOrbiter({ camera: halfSquareCamera, distance: 6 })

const renderTargetSize = 1024
const depthMap = ctx.texture2D({
  width: renderTargetSize,
  height: renderTargetSize,
  pixelFormat: ctx.PixelFormat.Depth,
  encoding: ctx.Encoding.Linear
})

const colorMap = ctx.texture2D({
  width: renderTargetSize,
  height: renderTargetSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})

const drawToTexture1Cmd = {
  name: 'drawPass',
  pass: ctx.pass({
    color: [colorMap],
    depth: depthMap,
    clearColor: [1, 0.5, 0.5, 1],
    clearDepth: 1
  })
}

const cube = createCube(1, 1, 1)
const cubeMesh = {
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(cube.positions)
    },
    aTexCoord: {
      buffer: ctx.vertexBuffer(cube.uvs)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(cube.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(cube.cells)
  }
}


const drawCube = {
  name: 'drawCube',
  pipeline: ctx.pipeline({
    vert: diffuseVert,
    frag: diffuseFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: halfSquareCamera.projectionMatrix,
    uViewMatrix: halfSquareCamera.viewMatrix,
    uModelMatrix: mat4.create(),
    uBaseColor: [1, 0, 0, 1]
  },
  ...cubeMesh
}

const torus = createTorus(0.5)
const torusMesh = {
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(torus.positions)
    },
    aTexCoord: {
      buffer: ctx.vertexBuffer(torus.uvs)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(torus.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(torus.cells)
  }
}

const drawTorus = {
  name: 'drawTorus',
  pipeline: ctx.pipeline({
    vert: diffuseVert,
    frag: diffuseFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: fullSquareCamera.projectionMatrix,
    uViewMatrix: fullSquareCamera.viewMatrix,
    uModelMatrix: mat4.create(),
    uBaseColor: [1, 0, 0, 1]
  },
  ...torusMesh
}

const drawTexturedCubeCmd = {
  name: 'drawTexturedCube',
  pipeline: ctx.pipeline({
    vert: texturedVert,
    frag: texturedFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  ...cubeMesh
}

const quadPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const quadTexCoords = [[0, 0], [1, 0], [1, 1], [0, 1]]
const quadFaces = [[0, 1, 2], [0, 2, 3]]

const drawTextureCmd = {
  name: 'drawTexture',
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(quadPositions),
    aTexCoord0: ctx.vertexBuffer(quadTexCoords)
  },
  indices: ctx.indexBuffer(quadFaces),
  uniforms: {
    uTexture: null
  }
}

let frameNumber = 0

const clearBlueBgPass = ctx.pass({
  clearColor: [0, 0.3, 1, 1]
})

const clearYellowBgPass = ctx.pass({
  clearColor: [1, 1, 0.2, 1]
})

const clearDepthPass = ctx.pass({
  clearDepth: 1
})

raf(function frame() {
  ctx.debug(++frameNumber === 1)

  const s = renderTargetSize

  const leftHalfView = {
    pass: clearBlueBgPass,
    viewport: [0, 0, s / 2, s],
    scissor: [0, 0, s / 2, s]
  }

  const rightHalfView = {
    pass: clearYellowBgPass,
    viewport: [s / 2, 0, s / 2, s],
    scissor: [s / 2, 0, s / 2, s]
  }

  const fullView = {
    pass: clearDepthPass,
    viewport: [0, 0, s, s],
    scissor: [0, 0, s, s]
  }

  ctx.submit(drawToTexture1Cmd,
    () => {
      ctx.submit(
        leftHalfView, () => {
          ctx.submit(drawCube)
        })
      ctx.submit(
        rightHalfView, () => {
          ctx.submit(drawCube, {
            uniforms: {
              uBaseColor: [0, 1, 0, 1]
            }
          })
        })
      ctx.submit(fullView, () => {
        ctx.submit(drawTorus, {
          uniforms: {
            uBaseColor: [1, 0, 1, 1]          
          }
        })
      })      
    }
  )

  camera.set({ aspect: ctx.gl.drawingBufferWidth / ctx.gl.drawingBufferHeight })

  ctx.submit(drawTexturedCubeCmd, {
    uniforms: {
      uTexture: colorMap,
      iProjectionMatrix: camera.projectionMatrix
    }
  })

  // ctx.submit(drawTextureCmd, {
  //   uniforms: {
  //     uTexture: normalMap
  //   },
  //   viewport: [256, 0, 256, 256]
  // })
  // ctx.submit(drawTextureCmd, {
  //   uniforms: {
  //     uTexture: depthMap
  //   },
  //   viewport: [0, 256, 256, 256]
  // })

  // ctx.submit(drawTextureCmd, {
  //   uniforms: {
  //     uTexture: colorMap2
  //   },
  //   viewport: [512, 0, 256, 256]
  // })

  window.dispatchEvent(new CustomEvent('pex-screenshot'))

  raf(frame)
})
