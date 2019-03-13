// Render to texture example
const createCube = require('primitive-cube')
const createSphere = require('primitive-sphere')
const mat4 = require('pex-math/mat4')

const createContext = require('../../pex-context')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const vec3 = require('pex-math').vec3
const GUI = require('pex-gui')
const load = require('pex-io').load

const ctx = createContext()
const gui = new GUI(ctx)

const state = {
  spherePosition: [0, 0, 0],
  reflections: true
}

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: window.innerWidth / window.innerHeight,
  position: [5, 5, 5],
  target: [0, 0, 0],
  near: 0.1,
  far: 50
})

createOrbiter({ camera: camera, distance: 10 })

const depthMapSize = 512
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  pixelFormat: ctx.PixelFormat.Depth,
  encoding: ctx.Encoding.Linear
})

const cubeInstances = [
  { position: [3, 0, 0], scale: 1.0, color: [1.0, 0.0, 0.0, 1.0] },
  { position: [-3, 0, 0], scale: 1.0, color: [1.0, 0.5, 0.0, 1.0] },
  { position: [0, 3, 0], scale: 1.0, color: [0.0, 0.8, 0.0, 1.0] },
  { position: [0, -3, 0], scale: 1, color: [0.0, 0.8, 0.8, 1.0] },
  { position: [0, 0, 3], scale: 1, color: [0.0, 0.0, 1.0, 1.0] },
  { position: [0, 0, -3], scale: 1, color: [0.5, 0.0, 1.0, 1.0] }
]

const clearScreenCmd = {
  name: 'clearScreen',
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1]
  })
}

const box = createCube(1, 1, 1)

const drawBoxCmd = {
  name: 'drawBox',
  pipeline: ctx.pipeline({
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uModelMatrix;
      uniform vec3 uPosition;
      uniform float uScale;

      varying vec3 vNormal;

      void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition * uScale + uPosition, 1.0);
        vNormal = aNormal;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision highp float;
      #endif

      varying vec3 vNormal;
      uniform vec4 uColor;

      void main() {
        vec3 L = normalize(vec3(1.0, 2.0, 3.0));
        vec3 N = normalize(vNormal);
        float diffuse = abs(dot(N, L));
        gl_FragColor.rgb = uColor.rgb * diffuse;
        gl_FragColor.a = 1.0;
      }
    `,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(box.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(box.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(box.cells)
  }
}

const sphere = createSphere()

const drawSphereCmd = {
  name: 'drawSphere',
  pipeline: ctx.pipeline({
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uModelMatrix;
      uniform vec3 uPosition;

      varying vec3 vNormalView;

      void main() {
        mat4 modelView = uViewMatrix * uModelMatrix;
        gl_Position = uProjectionMatrix * modelView * vec4(aPosition + uPosition, 1.0);
        vNormalView = vec3(modelView * vec4(aNormal, 0.0));
      }
    `,
    frag: `
      #ifdef GL_ES
      precision highp float;
      #endif

      varying vec3 vNormalView;
      uniform samplerCube uReflectionMap;
      uniform mat4 uInvViewMatrix;
      uniform float uFlipEnvMap;

      void main() {
        vec3 eyeDirView = vec3(0.0, 0.0, 1.0);
        vec3 R = reflect(-eyeDirView, normalize(vNormalView));
        vec3 reflectionWorld = vec3(uInvViewMatrix * vec4(R, 0.0));
        reflectionWorld.x *= uFlipEnvMap;
        gl_FragColor.rgb = textureCube(uReflectionMap, reflectionWorld).rgb;
        gl_FragColor.a = 1.0;
      }
    `,
    depthTest: true
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  },
  attributes: {
    aPosition: {
      buffer: ctx.vertexBuffer(sphere.positions)
    },
    aNormal: {
      buffer: ctx.vertexBuffer(sphere.normals)
    }
  },
  indices: {
    buffer: ctx.indexBuffer(sphere.cells)
  }
}

const CUBEMAP_SIZE = 512
const reflectionMap = ctx.textureCube({
  width: CUBEMAP_SIZE,
  height: CUBEMAP_SIZE,
  pixelFormat: ctx.PixelFormat.RGBA8,
  encoding: ctx.Encoding.SRGB
})

gui.addTextureCube('Reflection Cubemap RT', reflectionMap)
gui.addParam('Sphere pos', state, 'spherePosition', { min: -3, max: 3 })
gui.addParam('Reflections', state, 'reflections')

const sides = (this._sides = [
  { eye: [0, 0, 0], target: [1, 0, 0], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [-1, 0, 0], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [0, 1, 0], up: [0, 0, 1] },
  { eye: [0, 0, 0], target: [0, -1, 0], up: [0, 0, -1] },
  { eye: [0, 0, 0], target: [0, 0, 1], up: [0, -1, 0] },
  { eye: [0, 0, 0], target: [0, 0, -1], up: [0, -1, 0] }
].map((side, i) => {
  side.projectionMatrix = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    1,
    0.1,
    100
  ) // TODO: change this to radians
  side.viewMatrix = mat4.lookAt(mat4.create(), side.eye, side.target, side.up)
  side.drawPassCmd = {
    name: 'ReflectionProbe.sidePass',
    pass: ctx.pass({
      name: 'ReflectionProbe.sidePass',
      color: [
        {
          texture: reflectionMap,
          target: ctx.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i
        }
      ],
      depth: depthMap,
      clearColor: [0, 0, 0, 1],
      clearDepth: 1
    })
  }
  return side
}))

function drawBoxes(camera) {
  cubeInstances.forEach(cube => {
    if (camera) {
      ctx.submit(drawBoxCmd, {
        uniforms: {
          uPosition: cube.position,
          uScale: cube.scale,
          uColor: cube.color,
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix
        }
      })
    } else {
      ctx.submit(drawBoxCmd, {
        uniforms: {
          uPosition: cube.position,
          uScale: cube.scale,
          uColor: cube.color
        }
      })
    }
  })
}

const resources = {
  equirect: { image: 'assets/images/pisa_env.jpg' },
  negx: { image: `assets/images/pisa/pisa_negx.jpg` },
  negy: { image: `assets/images/pisa/pisa_negy.jpg` },
  negz: { image: `assets/images/pisa/pisa_negz.jpg` },
  posx: { image: `assets/images/pisa/pisa_posx.jpg` },
  posy: { image: `assets/images/pisa/pisa_posy.jpg` },
  posz: { image: `assets/images/pisa/pisa_posz.jpg` },
  testEquirect: { image: 'assets/images/test_env.png' },
  testnegx: { image: `assets/images/test/test_nx.png` },
  testnegy: { image: `assets/images/test/test_ny.png` },
  testnegz: { image: `assets/images/test/test_nz.png` },
  testposx: { image: `assets/images/test/test_px.png` },
  testposy: { image: `assets/images/test/test_py.png` },
  testposz: { image: `assets/images/test/test_pz.png` }
}

let envMap = null

load(resources, (err, res) => {
  if (err) console.log(err)

  var equirect = ctx.texture2D({
    data: res.equirect,
    encoding: ctx.Encoding.SRGB
  })
  gui.addTexture2D('Equirect', equirect)

  envMap = ctx.textureCube({
    data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
    width: res.negx.width,
    height: res.negy.height,
    encoding: ctx.Encoding.SRGB
  })
  gui.addTextureCube('EnvMap Cubemap File', envMap, { flipEnvMap: -1 })

  var testEquirect = ctx.texture2D({
    data: res.testEquirect,
    encoding: ctx.Encoding.SRGB
  })
  gui.addTexture2D('Test Equirect File', testEquirect)

  var testEnvMap = ctx.textureCube({
    data: [
      res.testposx,
      res.testnegx,
      res.testposy,
      res.testnegy,
      res.testposz,
      res.testnegz
    ],
    width: res.testnegx.width,
    height: res.testnegy.height,
    encoding: ctx.Encoding.SRGB
  })
  gui.addTextureCube('Test EnvMap Cubemap File', testEnvMap, { flipEnvMap: -1 })
})

const skyboxPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const skyboxFaces = [[0, 1, 2], [0, 2, 3]]

const drawSkyboxCmd = {
  pipeline: ctx.pipeline({
    vert: `
      //Based on http://gamedev.stackexchange.com/questions/60313/implementing-a-skybox-with-glsl-version-330
      attribute vec2 aPosition;

      mat4 inverse(mat4 m) {
        float
            a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],
            a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],
            a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],
            a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],

            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,

            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

        return mat4(
            a11 * b11 - a12 * b10 + a13 * b09,
            a02 * b10 - a01 * b11 - a03 * b09,
            a31 * b05 - a32 * b04 + a33 * b03,
            a22 * b04 - a21 * b05 - a23 * b03,
            a12 * b08 - a10 * b11 - a13 * b07,
            a00 * b11 - a02 * b08 + a03 * b07,
            a32 * b02 - a30 * b05 - a33 * b01,
            a20 * b05 - a22 * b02 + a23 * b01,
            a10 * b10 - a11 * b08 + a13 * b06,
            a01 * b08 - a00 * b10 - a03 * b06,
            a30 * b04 - a31 * b02 + a33 * b00,
            a21 * b02 - a20 * b04 - a23 * b00,
            a11 * b07 - a10 * b09 - a12 * b06,
            a00 * b09 - a01 * b07 + a02 * b06,
            a31 * b01 - a30 * b03 - a32 * b00,
            a20 * b03 - a21 * b01 + a22 * b00) / det;
      }

      #ifdef GL_ES
      mat3 transpose(mat3 m) {
        return mat3(m[0][0], m[1][0], m[2][0],
                    m[0][1], m[1][1], m[2][1],
                    m[0][2], m[1][2], m[2][2]);
      }
      #endif

      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;

      varying vec3 wcNormal;

      void main() {
          vec4 position = vec4(aPosition, 0.9999, 1.0);
          mat4 inverseProjection = inverse(uProjectionMatrix);
          mat3 inverseModelview = transpose(mat3(uViewMatrix));
          vec3 unprojected = (inverseProjection * position).xyz;
          wcNormal = inverseModelview * unprojected;

          gl_Position = position;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision highp float;
      #endif

      uniform samplerCube uEnvMap;

      varying vec3 wcNormal;

      void main() {
          vec3 N = normalize(wcNormal);
          N.x *= -1.0;
          vec3 color = textureCube(uEnvMap, N).rgb;
          gl_FragColor.rgb = color;
          gl_FragColor.a = 1.0;
      }`,
    depthTest: true,
    depthWrite: false,
    depthFunc: ctx.DepthFunc.Less
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uEnvMap: null
  },
  attributes: {
    aPosition: ctx.vertexBuffer(skyboxPositions)
  },
  indices: ctx.indexBuffer(skyboxFaces)
}

function drawSkybox(camera) {
  if (envMap) {
    if (camera) {
      ctx.submit(drawSkyboxCmd, {
        uniforms: {
          uEnvMap: envMap,
          uProjectionMatrix: camera.projectionMatrix,
          uViewMatrix: camera.viewMatrix
        }
      })
    } else {
      ctx.submit(drawSkyboxCmd, {
        uniforms: {
          uEnvMap: envMap
        }
      })
    }
  }
}

ctx.frame(() => {
  ctx.submit(clearScreenCmd)
  sides.forEach(side => {
    var target = [0, 0, 0]
    ctx.submit(side.drawPassCmd, () => {
      const position = state.spherePosition
      vec3.set(target, position)
      vec3.add(target, side.target)
      mat4.lookAt(side.viewMatrix, position, target, side.up)
      drawBoxes(side)
      drawSkybox(side)
    })
  })

  drawBoxes()
  drawSkybox()
  ctx.submit(drawSphereCmd, {
    uniforms: {
      uReflectionMap: state.reflections ? reflectionMap : envMap,
      uFlipEnvMap: state.reflections ? 1 : -1,
      uPosition: state.spherePosition,
      uInvViewMatrix: mat4.invert(mat4.copy(camera.viewMatrix))
    }
  })

  gui.draw()
})
