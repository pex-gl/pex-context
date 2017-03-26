// utils
// var debug = require('debug').enable('*')
// var extend = require('extend')

// sys
// var createWindow = require('./sys/createWindow')
// var loadImage = require('./sys/loadImage')
// var Time = require('./sys/Time')
// var Platform = require('./sys/Platform')

// glu
// var Program = require('./glu/Program')
// var VertexArray = require('./glu/VertexArray')
// var Context = require('./glu/Context')
// var ClearCommand = require('./glu/ClearCommand')
// var DrawCommand = require('./glu/DrawCommand')
// var TextureCube = require('./glu/TextureCube')
// var Framebuffer = require('./glu/Framebuffer')
// var Texture2D = require('./glu/Texture2D')
// var toVertexArray = require('./glu/createVertexArrayFromGeometry')

// geom
// var createCube = require('./agen/createCube')
// var createFSQ = require('./vgen/createFullScreenQuad')
const createCube = require('primitive-cube')
const bunny = require('bunny')
const normals = require('normals')
const centerAndNormalize = require('geom-center-and-normalize')
const Vec3 = require('pex-math/Vec3')
const Mat4 = require('pex-math/Mat4')
const Quat = require('pex-math/Quat')
const SimplexNoise = require('simplex-noise')
const R = require('ramda')
const random = require('pex-random')

// math
// var createMat4 = require('gl-mat4/create')
// var lookAt = require('gl-mat4/lookAt')
// var perspective = require('gl-mat4/perspective')
// var translate = require('gl-mat4/translate')
// var copy3 = require('gl-vec3/copy')

// shaders
// var glslify = require('glslify-promise')

const createContext = require('../../pex-context')
const raf = require('raf')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
// const load = require('pex-io/load')
const glsl = require('glslify')

const ctx = createContext()

let elapsedSeconds = 0
let prevTime = Date.now()
const noise = new SimplexNoise()

const camera = createCamera({
  fov: 45, // TODO: change fov to radians
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [3, 0.5, 3],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const lightCamera = createCamera({
  fov: 45, // TODO: change fov to radians,
  aspect: 1,
  near: 1,
  far: 50,
  position: [3, 14, 3],
  target: [0, 0, 0]
})

const depthMapSize = 1024
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  format: ctx.PixelFormat.Depth
})
const colorMap = ctx.texture2D({ width: depthMapSize, height: depthMapSize })

const depthPassCmd = {
  name: 'depthPass',
  pass: ctx.pass({
    color: [ colorMap ],
    depth: depthMap,
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const drawPassCmd = {
  name: 'drawPass',
  pass: ctx.pass({
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const showNormalsVert = glsl(__dirname + '/glsl/show-normals.vert')
const showNormalsFrag = glsl(__dirname + '/glsl/show-normals.frag')
const shadowMappedVert = glsl(__dirname + '/glsl/shadow-mapped.vert')
const shadowMappedFrag = glsl(__dirname + '/glsl/shadow-mapped.frag')
// BlitVert: glslify(__dirname + '/sh/materials/Blit.vert'),
// BlitFrag: glslify(__dirname + '/sh/materials/Blit.frag')

const floor = createCube(5, 0.1, 5)
const drawFloorCmd = {
  name: 'drawFloor',
  pipeline: ctx.pipeline({
    vert: shadowMappedVert,
    frag: shadowMappedFrag,
    depthEnabled: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: Mat4.create(),
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1]
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

const drawFloorDepthCmd = {
  name: 'drawFloorDepth',
  pipeline: ctx.pipeline({
    vert: showNormalsVert,
    frag: showNormalsFrag,
    depthEnabled: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: Mat4.create()
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(floor.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(floor.normals)
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(floor.cells)
  }
}

const bunnyBaseVertices = centerAndNormalize(bunny.positions).map((p) => Vec3.scale(p, 2))
const bunnyBaseNormals = normals.vertexNormals(bunny.cells, bunny.positions)
const bunnyNoiseVertices = centerAndNormalize(bunny.positions).map((p) => Vec3.scale(p, 2))

const bunnyPositionBuffer = ctx.vertexBuffer(bunnyBaseVertices)
const bunnyNormalBuffer = ctx.vertexBuffer(bunnyBaseNormals)

const drawBunnyCmd = {
  name: 'drawBunny',
  pipeline: ctx.pipeline({
    vert: shadowMappedVert,
    frag: shadowMappedFrag,
    depthEnabled: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    // FIXME: because we pass by reference this matrix will keep updating without us
    // doing anything, is that but or a feature? Should i cache and force uViewMatrix: () => camera.viewMatrix
    // to mark the uniform as "dynamic" ?
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: Mat4.translate(Mat4.create(), [0, 1, 0]),
    uWrap: 0,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0, 0, 0, 1],
    uDiffuseColor: [1, 1, 1, 1]
  },
  attributes: {
    aPosition: {
      buffer: bunnyPositionBuffer
    },
    aNormal: {
      buffer: bunnyNormalBuffer
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  }
}

const drawBunnyDepthCmd = {
  name: 'drawBunnyDepth',
  pipeline: ctx.pipeline({
    vert: showNormalsVert,
    frag: showNormalsFrag,
    depthEnabled: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: Mat4.translate(Mat4.create(), [0, 1, 0])
  },
  attributes: {
    aPosition: {
      buffer: bunnyPositionBuffer
    },
    aNormal: {
      buffer: bunnyNormalBuffer
    }
  },
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  }
}

function updateTime () {
  const now = Date.now()
  const deltaTime = (now - prevTime) / 1000
  elapsedSeconds += deltaTime
  prevTime = now
}

function updateCamera () {
  const t = elapsedSeconds / 10
  const x = 6 * Math.cos(Math.PI * t)
  const y = 3
  const z = 6 * Math.sin(Math.PI * t)
  camera({ position: [x, y, z] })
}

function updateBunny (ctx) {
  const noiseFrequency = 1
  const noiseScale = 0.1
  for (let i = 0; i < bunnyBaseVertices.length; i++) {
    var v = bunnyNoiseVertices[i]
    var n = bunnyBaseNormals[i]
    Vec3.set(v, bunnyBaseVertices[i])
    var f = noise.noise3D(v[0] * noiseFrequency, v[1] * noiseFrequency, v[2] * noiseFrequency + elapsedSeconds)
    v[0] += n[0] * noiseScale * (f + 1)
    v[1] += n[1] * noiseScale * (f + 1)
    v[2] += n[2] * noiseScale * (f + 1)
  }

  ctx.update(bunnyPositionBuffer, { data: bunnyNoiseVertices })

  // Update options:
  // 1) direct update buffer
  // bunnyPositionBuffer.bufferData(positionData)
  //
  // 2) direct update via ctx
  // ctx.update(bunnyPositionBuffer, { data: positionData })
  //
  // 3) update command
  // const updateCommand = ctx.update({ target: bunnyPositionBuffer, data: positionData })
  // ctx.submit(updatePositions)

  // FIXME: pre-allocate buffer
  // FIXME: add update command
  // What are the update patterns in other APIs?
  const normalData = normals.vertexNormals(bunny.cells, bunnyNoiseVertices)
  // bunnyNormalBuffer.bufferData(normalData)
  ctx.update(bunnyNormalBuffer, { data: normalData })
}

const drawFullscreenQuadCmd = {
  name: 'drawFullscreenQuad',
  pipeline: ctx.pipeline({
    vert: glsl(__dirname + '/glsl/screen-image.vert'),
    frag: glsl(__dirname + '/glsl/screen-image.frag'),
    depthEnabled: false
  }),
  attributes: {
    // aPosition: { buffer: ctx.vertexBuffer(new Float32Array(R.flatten([[-1, -1], [1, -1], [1, 1], [-1, 1]]))) },
    aPosition: { buffer: ctx.vertexBuffer(new Float32Array(R.flatten([[-1, -1], [-2 / 4, -1], [-2 / 4, -1 / 3], [-1, -1 / 3]]))) },
    aTexCoord0: { buffer: ctx.vertexBuffer(new Float32Array(R.flatten([[0, 0], [1, 0], [1, 1], [ 0, 1]]))) }
  },
  indices: {
    buffer: ctx.indexBuffer(new Uint16Array(R.flatten([[0, 1, 2], [0, 2, 3]])))
  },
  uniforms: {
    uTexture: depthMap
  }
}

// console.time('frame')

const shadowBatches = []
const batches = []
const numBunnies = 500
for (let i = 0; i < numBunnies; i++) {
  const pos = [random.float(-5, 5), random.float(0, 5), random.float(-5, 5)]
  const color = [random.float(), random.float(), random.float(), 1.0]
  const m = Mat4.create()
  Mat4.translate(m, pos)
  Mat4.mult(m, Mat4.fromQuat(Mat4.create(), Quat.fromDirection(Quat.create(), random.vec3())))
  Mat4.scale(m, [0.2, 0.2, 0.2])

  shadowBatches.push({
    uniforms: {
      uModelMatrix: m
    }
  })
  batches.push({
    uniforms: {
      uModelMatrix: m,
      uDiffuseColor: color
    }
  })
}

let frameNumber = 0
// console.time('frame')
raf(function frame () {
  // console.timeEnd('frame')
  // console.time('frame')
  updateTime()
  updateCamera()
  updateBunny(ctx)
  ctx.debug((++frameNumber) === 1)
  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd)
    ctx.submit(drawBunnyDepthCmd, shadowBatches)
  })
  ctx.submit(drawPassCmd, () => {
    ctx.submit(drawFloorCmd)
    ctx.submit(drawBunnyCmd, batches)
    ctx.submit(drawFullscreenQuadCmd)
  })

  raf(frame)
})
