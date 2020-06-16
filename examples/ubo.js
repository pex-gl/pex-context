const createContext = require('../')
const createCube = require('primitive-cube')
const { perspective: createCamera, orbiter: createOrbiter } = require('pex-cam')

const basicVert = /* glsl */ `#version 300 es
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

out vec3 vNormal;

void main () {
  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
}
`

const basicFrag = /* glsl */ `#version 300 es
precision mediump float;

in vec3 vNormal;
out vec4 fragColor;

layout(std140, column_major) uniform;

struct Material {
  vec4 color;
};

uniform PerMesh {
  Material material;
} uPerMesh;

void main () {
  fragColor.rgb = vNormal * 0.5 + 0.5;
  fragColor.rgb = uPerMesh.material.color.rgb;
  fragColor.a = 1.0;
}
`

//TODO: this should be handled automatically
const canvas = document.createElement('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.position = 'absolute'
canvas.style.left = 0
canvas.style.top = 0
document.body.appendChild(canvas)
const gl = canvas.getContext('webgl2')

const ctx = createContext({
  pixelRatio: window.devicePixelRatio,
  gl: gl
})

const cube = createCube()
const camera = createCamera({
  position: [2, 2, 2],
  fov: Math.PI / 3,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
})
const orbiter = createOrbiter({ camera })

const ubo = ctx.uniformBuffer([1, 0.2, 1, 1])

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicVert,
    frag: basicFrag
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals)
  },
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
  uniformBlocks: {
    PerMesh: ubo    
  }
}

window.addEventListener('resize', () => {
  ctx.set({
    width: window.innerWidth,
    height: window.innerHeight
  })
  camera.set({
    aspect: ctx.gl.canvas.width / ctx.gl.canvas.height
  })
})

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    }
  })  
})
