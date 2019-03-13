const ctx = require('..')()
const random = require('pex-random')
const mat4 = require('pex-math/mat4')
const mat3 = require('pex-math/mat3')
const vec4 = require('pex-math/vec4')
const ShowNormals = require('pex-materials/show-normals')

const W = ctx.gl.drawingBufferWidth
const H = ctx.gl.drawingBufferHeight
const vw = 800
const vh = 400
const vx = (W - vw) / 2
const vy = (H - vh) / 2
const viewport = [vx, vy, vw, vh]

const camera = require('pex-cam/perspective')({
  fov: Math.PI / 4,
  aspect: vw / vh,
  near: 0.1,
  far: 1000,
  target: [0, 0, 0],
  position: [5, 1, 5]
})

const oribter = require('pex-cam/orbiter')({ camera: camera })

const cube = require('primitive-cube')(0.5)

const cubes = []
for (var i = 0; i < 8; i++) {
  const pos = random.vec3(3)
  const m = mat4.create()
  mat4.translate(m, pos)

  const label = document.createElement('span')
  label.innerText = 'Cube ' + i
  label.style.position = 'absolute'
  label.style.left = '50px'
  label.style.top = '50px'
  label.style.color = 'white'
  label.style.fontFamily = 'sans-serif'
  label.style.pointerEvents = 'none'
  document.body.appendChild(label)

  cubes.push({
    label: label,
    position: pos,
    modelMatrix: m,
    normalMatrix: mat3.create()
  })
}

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.1, 0.1, 0.1, 1.0],
    clearDepth: 1
  })
}

const drawInViewport = {
  pass: ctx.pass({
    clearColor: [0.3, 0.3, 0.3, 1]
  }),
  viewport: viewport,
  scissor: viewport
}

const drawCubeCmd = {
  pipeline: ctx.pipeline({
    vert: ShowNormals.Vert,
    frag: ShowNormals.Frag,
    depthTest: true
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

const tempMat = mat4.create()
const pos = [0, 0, 0, 0]

ctx.frame(() => {
  ctx.submit(clearCmd)

  ctx.submit(drawInViewport, () => {
    cubes.forEach(c => {
      // normal matrix = inverse transpose of model view matrix
      // you can just pass mat3(viewMatrix) if you scaling is uniform
      mat4.identity(tempMat)
      mat4.mult(tempMat, c.modelMatrix)
      mat4.mult(tempMat, camera.viewMatrix)
      mat4.invert(tempMat)
      mat4.transpose(tempMat)
      mat3.fromMat4(c.normalMatrix, tempMat)

      // more info at MDN
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection

      // model space to world space
      // just convert vec3 to vec4, we need 'w' compoent
      // we assume model position is [0, 0, 0] so world position is c.position
      // we could also transform 0,0,0 point by model matrix
      // vec4.multMat4([0, 0, 0, 1], c.modelMatrix)
      vec4.fromVec3(pos, c.position)
      pos[3] = 1 // vec4 bug fix

      if (Math.random() > 0.99) console.log(c.position)

      // world space to view space
      vec4.multMat4(pos, camera.viewMatrix)

      // view space to clip space
      vec4.multMat4(pos, camera.projectionMatrix)

      // homogeneous coordinates to cartesian coordinates
      // "When dividing by w, this can effectively increase the precision
      // of very large numbers by operating on two potentially smaller,
      // less error-prone numbers."
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
      const w = pos[3]
      if (w !== 0) {
        pos[0] /= w
        pos[1] /= w
        pos[2] /= w
      }

      // homogeneous coordinates [-1, 1] to normalized [0, 1]
      // note that we multiply y by -0.5 because in WebGL Y axis increases up
      // and in HTML / Canvas it increases from top to bottom
      pos[0] = pos[0] * 0.5 + 0.5
      pos[1] = pos[1] * -0.5 + 0.5

      // normalized to screen coordinates
      pos[0] = viewport[0] + pos[0] * viewport[2]
      pos[1] = viewport[1] + pos[1] * viewport[3]

      c.label.style.left = pos[0] + 'px'
      c.label.style.top = pos[1] + 'px'

      ctx.submit(drawCubeCmd, {
        uniforms: {
          uModelMatrix: c.modelMatrix,
          uNormalMatrix: c.normalMatrix
        }
      })
    })
  })
})
