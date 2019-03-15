require('debug').enable('*')
const createCube = require('primitive-cube')
const bunny = require('bunny')
// const bunny = require('primitive-cube')()
const normals = require('normals')
const centerAndNormalize = require('geom-center-and-normalize')
const vec3 = require('pex-math/vec3')
const mat4 = require('pex-math/mat4')
const quat = require('pex-math/quat')
const SimplexNoise = require('simplex-noise')
const random = require('pex-random')

const createContext = require('../../pex-context')
const raf = require('raf')
const createCamera = require('pex-cam/perspective')

const screenImageVert = require('./shaders/screen-image.vert')
const screenImageFrag = require('./shaders/screen-image.frag')
const showNormalsVert = require('./shaders/show-normals.vert.js')
const showNormalsInstancedVert = require('./shaders/show-normals-instanced.vert')
const shadowMappedInstancedVert = require('./shaders/shadow-mapped-instanced.vert')
const showNormalsFrag = require('./shaders/show-normals.frag.js')
const gammaGlsl = require('./shaders/gamma.glsl.js')

const { transposeMat4, inverseMat4 } = require('./shaders/math.glsl')

const ctx = createContext()

let elapsedSeconds = 0
let prevTime = Date.now()
const noise = new SimplexNoise()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [3, 0.5, 3],
  target: [0, 2, 0]
})

const lightCamera = createCamera({
  fov: Math.PI / 4,
  aspect: 1,
  near: 5,
  far: 20,
  position: [1, 14, 1],
  target: [0, 0, 0]
})

const depthMapSize = 1024
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.Depth,
  encoding: ctx.Encoding.Linear,
  min: ctx.Filter.Linear,
  mag: ctx.Filter.Linear
})
const colorMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})

const depthPassCmd = {
  name: 'depthPass',
  pass: ctx.pass({
    color: [colorMap],
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

const shadowMappedVert = /* glsl */ `
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec4 uAlbedoColor;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormalWorld;
varying vec3 vWorldPosition;
varying vec4 vColor;

${inverseMat4}
${transposeMat4}

void main() {
  mat4 modelView = uViewMatrix * uModelMatrix;
  gl_Position = uProjectionMatrix * modelView * vec4(aPosition, 1.0);
  vWorldPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  mat4 invViewMatrix = inverse(uViewMatrix);
  vec3 normalView = mat3(transpose(inverse(modelView))) * aNormal;
  vNormalWorld = vec3(invViewMatrix * vec4(normalView, 0.0));
  vColor = uAlbedoColor;
}
`

const shadowMappedFrag = /* glsl */ `
precision highp float;

uniform vec4 uAmbientColor;
uniform vec3 uLightPos;
uniform float uWrap;
uniform float uLightNear;
uniform float uLightFar;
uniform sampler2D uDepthMap;
uniform mat4 uLightProjectionMatrix;
uniform mat4 uLightViewMatrix;

varying vec3 vNormalWorld;
varying vec3 vWorldPosition;
varying vec4 vColor;

${gammaGlsl}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float ndcDepthToEyeSpace(float ndcDepth) {
  return 2.0 * uLightNear * uLightFar / (uLightFar + uLightNear - ndcDepth * (uLightFar - uLightNear));
}

//fron depth buf normalized z to linear (eye space) z
//http://stackoverflow.com/questions/6652253/getting-the-true-z-value-from-the-depth-buffer
float readDepth(sampler2D depthMap, vec2 coord) {
  float z_b = texture2D(depthMap, coord).r;
  float z_n = 2.0 * z_b - 1.0;
  return ndcDepthToEyeSpace(z_n);
}

void main() {
  vec3 L = normalize(uLightPos);
  vec3 N = normalize(vNormalWorld);
  float NdotL = max(0.0, (dot(N, L) + uWrap) / (1.0 + uWrap));
  vec3 ambient = toLinear(uAmbientColor.rgb);
  vec3 albedo = toLinear(vColor.rgb);

  vec4 lightViewPosition = uLightViewMatrix * vec4(vWorldPosition, 1.0);
  float lightDist1 = -lightViewPosition.z;
  vec4 lightDeviceCoordsPosition = uLightProjectionMatrix * lightViewPosition;
  vec2 lightDeviceCoordsPositionNormalized = lightDeviceCoordsPosition.xy / lightDeviceCoordsPosition.w;
  vec2 lightUV = lightDeviceCoordsPositionNormalized.xy * 0.5 + 0.5;
  float bias = 0.1;
  float lightDist2 = readDepth(uDepthMap, lightUV);

  float illuminated = 1.0;
  if (lightDist1 > lightDist2 + bias) {
    illuminated = 0.0;
  }

  gl_FragColor.rgb = albedo * (ambient + NdotL * illuminated);

  gl_FragColor.rgb = toGamma(gl_FragColor.rgb);

  gl_FragColor.a = 1.0;
}
`

const floor = createCube(5, 0.1, 5)
const drawFloorCmd = {
  name: 'drawFloor',
  pipeline: ctx.pipeline({
    vert: shadowMappedVert,
    frag: shadowMappedFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create(),
    uWrap: 1,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0.2, 0.2, 0.2, 1],
    uAlbedoColor: [1, 1, 1, 1]
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
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
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
  // FIXME: rename this to indexBuffer?
  indices: {
    buffer: ctx.indexBuffer(floor.cells)
  }
}

const offsets = []
const rotations = []
const scales = []
const colors = []
const numBunnies = 200 // for some reason this is much slower than batching
random.seed(0)
for (let i = 0; i < numBunnies; i++) {
  const pos = [random.float(-5, 5), random.float(0, 5), random.float(-5, 5)]
  const rotation = quat.fromTo(
    quat.create(),
    [0, 0, 1],
    vec3.normalize(random.vec3())
  )
  const scale = [0.2, 0.2, 0.2]
  const color = [
    random.float(0.1, 1.0),
    random.float(0.1, 1.0),
    random.float(0.1, 1.0),
    1.0
  ]

  offsets.push(pos)
  rotations.push(rotation)
  scales.push(scale)
  colors.push(color)
}

const bunnyBaseVertices = centerAndNormalize(bunny.positions).map((p) =>
  vec3.scale(p, 2)
)
const bunnyBaseNormals = normals.vertexNormals(bunny.cells, bunny.positions)
const bunnyNoiseVertices = centerAndNormalize(bunny.positions).map((p) =>
  vec3.scale(p, 2)
)

const bunnyPositionBuffer = ctx.vertexBuffer(bunnyBaseVertices)
const bunnyNormalBuffer = ctx.vertexBuffer(bunnyBaseNormals)
const bunnyOffsetsBuffer = ctx.vertexBuffer(offsets)
const bunnyRotationsBuffer = ctx.vertexBuffer(rotations)
const bunnyScalesBuffer = ctx.vertexBuffer(scales)
const bunnyColorsBuffer = ctx.vertexBuffer(colors)

const drawBunnyCmd = {
  name: 'drawBunny',
  pipeline: ctx.pipeline({
    vert: shadowMappedInstancedVert,
    frag: shadowMappedFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    // FIXME: because we pass by reference this matrix will keep updating without us
    // doing anything, is that but or a feature? Should i cache and force uViewMatrix: () => camera.viewMatrix
    // to mark the uniform as "dynamic" ?
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [0, 1, 0]),
    uWrap: 1,
    uLightNear: lightCamera.near,
    uLightFar: lightCamera.far,
    uLightProjectionMatrix: lightCamera.projectionMatrix,
    uLightViewMatrix: lightCamera.viewMatrix,
    uLightPos: lightCamera.position,
    uDepthMap: depthMap,
    uAmbientColor: [0.2, 0.2, 0.2, 1],
    uAlbedoColor: [1, 1, 1, 1]
  },
  attributes: {
    aPosition: { buffer: bunnyPositionBuffer },
    aNormal: { buffer: bunnyNormalBuffer },
    aOffset: { buffer: bunnyOffsetsBuffer, divisor: 1 },
    aRotation: { buffer: bunnyRotationsBuffer, divisor: 1 },
    aScale: { buffer: bunnyScalesBuffer, divisor: 1 },
    aColor: { buffer: bunnyColorsBuffer, divisor: 1 }
  },
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  },
  instances: offsets.length
}

const drawBunnyDepthCmd = {
  name: 'drawBunnyDepth',
  pipeline: ctx.pipeline({
    vert: showNormalsInstancedVert,
    frag: showNormalsFrag,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: lightCamera.projectionMatrix,
    uViewMatrix: lightCamera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [0, 1, 0])
  },
  attributes: {
    aPosition: { buffer: bunnyPositionBuffer },
    aNormal: { buffer: bunnyNormalBuffer },
    aOffset: { buffer: bunnyOffsetsBuffer, divisor: 1 },
    aRotation: { buffer: bunnyRotationsBuffer, divisor: 1 },
    aScale: { buffer: bunnyScalesBuffer, divisor: 1 }
  },
  indices: {
    buffer: ctx.indexBuffer(bunny.cells)
  },
  instances: offsets.length
}

function updateTime() {
  const now = Date.now()
  const deltaTime = (now - prevTime) / 1000
  elapsedSeconds += deltaTime
  prevTime = now
}

function updateCamera() {
  const t = elapsedSeconds / 10 + 0.5
  const x = 6 * Math.cos(Math.PI * t)
  const y = 3
  const z = 6 * Math.sin(Math.PI * t)
  camera.set({ position: [x, y, z] })
}

function updateBunny(ctx) {
  const noiseFrequency = 1
  const noiseScale = 0.1
  for (let i = 0; i < bunnyBaseVertices.length; i++) {
    const v = bunnyNoiseVertices[i]
    const n = bunnyBaseNormals[i]
    vec3.set(v, bunnyBaseVertices[i])
    const f = noise.noise3D(
      v[0] * noiseFrequency,
      v[1] * noiseFrequency,
      v[2] * noiseFrequency + elapsedSeconds
    )
    v[0] += n[0] * noiseScale * (f + 1)
    v[1] += n[1] * noiseScale * (f + 1)
    v[2] += n[2] * noiseScale * (f + 1)
  }

  ctx.update(bunnyPositionBuffer, { data: bunnyNoiseVertices })

  const normalData = normals.vertexNormals(bunny.cells, bunnyNoiseVertices)
  ctx.update(bunnyNormalBuffer, { data: normalData })
}

const drawFullscreenQuadCmd = {
  name: 'drawFullscreenQuad',
  pipeline: ctx.pipeline({
    vert: screenImageVert,
    frag: screenImageFrag,
    depthTest: false
  }),
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer([
        [-1, -1],
        [-2 / 4, -1],
        [-2 / 4, -1 / 3],
        [-1, -1 / 3]
      ])
    },
    aTexCoord0: { buffer: ctx.vertexBuffer([[0, 0], [1, 0], [1, 1], [0, 1]]) }
  },
  indices: {
    buffer: ctx.indexBuffer([[0, 1, 2], [0, 2, 3]])
  },
  uniforms: {
    uTexture: depthMap
  }
}

let frameNumber = 0
raf(function frame() {
  updateTime()
  updateCamera()
  updateBunny(ctx)
  ctx.debug(++frameNumber < 3)

  ctx.submit(depthPassCmd, () => {
    ctx.submit(drawFloorDepthCmd)
    ctx.submit(drawBunnyDepthCmd)
  })
  ctx.submit(drawPassCmd, () => {
    ctx.submit(drawFloorCmd)
    ctx.submit(drawBunnyCmd)
    ctx.submit(drawFullscreenQuadCmd)
  })

  raf(frame)
})
