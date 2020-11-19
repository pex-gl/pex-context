const createContext = require('../')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const mat4 = require('pex-math/mat4')

const ctx = createContext()

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [0, 0, 6],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const VERT = /* glsl */ `
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  void main () {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    gl_PointSize = 5.0;
  }
`
const FRAG = /* glsl */ `
  precision highp float;

  uniform vec4 uColor;
  void main () {
    gl_FragColor = uColor;
  }
`

const corners = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]]

const drawPoints = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Points
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners)
  },
  indices: ctx.indexBuffer([0, 1, 2, 3]),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [-4, 0, 0]),
    uColor: [1, 1, 1, 1]
  }
}

const drawLines = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Lines
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners)
  },
  indices: ctx.indexBuffer([[0, 1], [2, 3]]),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [-2.5, 0, 0]),
    uColor: [1, 1, 1, 1]
  }
}

const drawLineStrip = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.LineStrip
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners)
  },
  indices: ctx.indexBuffer([0, 1, 2, 3]),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [-1, 0, 0]),
    uColor: [1, 1, 1, 1]
  }
}

const drawTriangles = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Triangles
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners)
  },
  indices: ctx.indexBuffer([[0, 1, 2]]),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [0.5, 0, 0]),
    uColor: [1, 1, 1, 1]
  }
}

const drawTriangleStrip = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.TriangleStrip
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners)
  },
  indices: ctx.indexBuffer([0, 1, 3, 2]),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.translate(mat4.create(), [2, 0, 0]),
    uColor: [1, 1, 1, 1]
  }
}

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1.0],
    clearDepth: 1
  })
}

ctx.frame(function() {
  ctx.submit(clearCmd)
  ctx.submit(drawPoints)
  ctx.submit(drawLines)
  ctx.submit(drawLineStrip)
  ctx.submit(drawTriangles)
  ctx.submit(drawTriangleStrip)

  window.dispatchEvent(new CustomEvent('pex-screenshot'))
})
