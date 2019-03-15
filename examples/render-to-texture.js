const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

const createContext = require('../../pex-context')
const raf = require('raf')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')

const showNormalsVert = require('./shaders/show-normals.vert')
const showNormalsMRTFrag = require('./shaders/show-normals-mrt.frag')
const screenImageVert = require('./shaders/screen-image.vert')
const screenImageFrag = require('./shaders/screen-image.frag')

const ctx = createContext()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  position: [3, 0.5, 3],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

createOrbiter({ camera: camera, distance: 6 })

const depthMapSize = 1024
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.Depth,
  encoding: ctx.Encoding.Linear
})

const colorMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})
const normalMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.Linear
})
const colorMap2 = ctx.texture2D({
  width: depthMapSize / 2,
  height: depthMapSize / 2,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})

const clearScreenCmd = {
  name: 'clearScreen',
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1]
  })
}

const drawPassCmd = {
  name: 'drawPass',
  pass: ctx.pass({
    color: [colorMap, normalMap],
    depth: depthMap,
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const drawPass2Cmd = {
  name: 'drawPass2',
  pass: ctx.pass({
    color: [colorMap2],
    // depth: depthMap2,
    clearColor: [0, 0, 1, 1],
    clearDepth: 1
  })
}

const floor = createCube(2, 0.1, 2)

const drawFloorCmd = {
  name: 'drawFloor',
  pipeline: ctx.pipeline({
    vert: showNormalsVert,
    frag: showNormalsMRTFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(floor.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(floor.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(floor.cells)
  }
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

raf(function frame() {
  ctx.debug(++frameNumber === 1)

  ctx.submit(clearScreenCmd)
  ctx.submit(
    drawPassCmd,
    {
      viewport: [0, 0, 1024, 1024]
    },
    () => {
      ctx.submit(drawFloorCmd)
    }
  )

  ctx.submit(
    drawPass2Cmd,
    {
      // viewport: [0, 0, 512, 512]
    },
    () => {
      ctx.submit(drawFloorCmd)
    }
  )

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap
    },
    viewport: [0, 0, 256, 256]
  })

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: normalMap
    },
    viewport: [256, 0, 256, 256]
  })
  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: depthMap
    },
    viewport: [0, 256, 256, 256]
  })

  ctx.submit(drawTextureCmd, {
    uniforms: {
      uTexture: colorMap2
    },
    viewport: [512, 0, 256, 256]
  })

  raf(frame)
})
