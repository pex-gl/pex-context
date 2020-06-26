const createContext = require('../')
const createCube = require('primitive-cube')
const { perspective: createCamera, orbiter: createOrbiter } = require('pex-cam')
const { mat4 } = require('pex-math')

const basicVert = /* glsl */ `#version 300 es
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

layout(std140, column_major) uniform;

struct Material {
  vec4 color;
};

uniform PerMesh {
  Material material;
  mat4 modelMatrix;
} uPerMesh;

out vec3 vNormal;

void main () {
  gl_Position = uProjectionMatrix * uViewMatrix * uPerMesh.modelMatrix * vec4(aPosition, 1.0);
  vNormal = aNormal;
}
`

const basicFrag = /* glsl */ `#version 300 es
precision highp float;

in vec3 vNormal;
out vec4 fragColor;

layout(std140, column_major) uniform;

struct Material {
  vec4 color;
  mat4 modelMatrix;
};

uniform PerMesh {
  Material material;
  mat4 modelMatrix;
} uPerMesh;

void main () {  
  fragColor.rgb = uPerMesh.material.color.rgb;
  fragColor.rgb += 0.2 * (vNormal * 0.5 + 0.5);
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


var mesh1data = [1, 0.51, 0.9, 1, ...mat4.create()]
var mesh2data = [1, 0.6, 0, 1, ...mat4.translate(mat4.create(), [0.5, 0.5, -0.5])]
var mesh3data = [0.2, 0.4, 1, 1, ...mat4.translate(mat4.create(), [-0.25, 0.25, -0.25])]
const ubo = ctx.uniformBuffer({ data: new Float32Array(1024) })
ctx.update(ubo, { data: mesh1data, offset: 0})
ctx.update(ubo, { data: mesh2data, offset: 256})
ctx.update(ubo, { data: mesh3data, offset: 256 * 2})
// ctx.update(ubo, { data: [...mesh1data, ...new Array(256 / 4 - 20).fill(0), ...mesh2data]})
console.log('ubo', [
  ...mesh1data,
  ...new Array(256 - 80 / 4).fill(0),
  ...mesh2data
])

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0, 0, 0, 1],
    clearDepth: 1
  })
}

const drawCmd = {
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
    uViewMatrix: camera.viewMatrix
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

console.log(ctx.gl.getParameter(ctx.gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT))
ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    },
    uniformBlocks: {
      PerMesh: ubo
    }
  })
  var err = ctx.gl.getError()
  if (err) {
    console.log('error', err)
  }
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    },
    uniformBlocks: {
      PerMesh: {
        buffer: ubo,
        offset: 256,
        size: 80
      }
    }
  })
  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix
    },
    uniformBlocks: {
      PerMesh: {
        buffer: ubo,
        offset: 512,
        size: 80
      }
    }
  })
})
