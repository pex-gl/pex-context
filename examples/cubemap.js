const createContext = require('../../pex-context')
const load = require('pex-io/load')
const raf = require('raf')
const isBrowser = require('is-browser')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const createSphere = require('primitive-sphere')
const mat4 = require('pex-math/mat4')
const glsl = require('glslify')
const GUI = require('pex-gui')

const ctx = createContext()
const gui = new GUI(ctx)

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [0, 0.5, 3],
  target: [0, 0, 0]
})

createOrbiter({ camera: camera, distance: 10 })

const ASSETS_DIR = isBrowser ? 'assets' : `${__dirname}/assets`

const clearScreenCmd = {
  pass: ctx.pass({
    clearColor: [0.5, 0.5, 0.5, 1],
    clearDepth: 1
  })
}

const sphere = createSphere()

const drawCmd = {
  pipeline: ctx.pipeline({
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      uniform mat4 uModelMatrix;

      varying vec3 vNormalWorld;
      varying vec3 vPositionWorld;

      void main () {
        vec4 positionWorld = uModelMatrix * vec4(aPosition, 1.0);
        vPositionWorld = positionWorld.xyz;
        gl_Position = uProjectionMatrix * uViewMatrix * positionWorld;
        vNormalWorld = mat3(uModelMatrix) * aNormal;
      }
    `,
    frag: `
      #ifdef GL_ES
      precision highp float;
      #endif
      varying vec3 vNormalWorld;
      varying vec3 vPositionWorld;
      uniform vec3 uCameraPosition;
      uniform samplerCube uEnvMap;
      void main () {
        vec3 N = normalize(vNormalWorld);
        vec3 I = normalize(vPositionWorld - uCameraPosition);
        vec3 R = reflect(I, N);
        R.z *= -1.0;
        gl_FragColor = textureCube(uEnvMap, R);
      }
    `,
    depthTest: true
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(sphere.positions),
    aNormal: ctx.vertexBuffer(sphere.normals)
  },
  indices: ctx.indexBuffer(sphere.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
    uModelMatrix: mat4.create()
  }
}

const skyboxPositions = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
const skyboxFaces = [[0, 1, 2], [0, 2, 3]]

const drawSkybox = {
  pipeline: ctx.pipeline({
    vert: glsl`
      //Based on http://gamedev.stackexchange.com/questions/60313/implementing-a-skybox-with-glsl-version-330
      attribute vec2 aPosition;

      #pragma glslify: inverse = require('glsl-inverse')

      #ifdef GL_ES
      #pragma glslify: transpose = require('glsl-transpose')
      #endif

      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;

      varying vec3 wcNormal;

      void main() {
          vec4 position = vec4(aPosition, 0.0, 1.0);
          mat4 inverseProjection = inverse(uProjectionMatrix);
          mat3 inverseModelview = transpose(mat3(uViewMatrix));
          vec3 unprojected = (inverseProjection * position).xyz;
          wcNormal = inverseModelview * unprojected;

          gl_Position = position;
      }
    `,
    frag: glsl`
      #ifdef GL_ES
      precision highp float;
      #endif

      // #pragma glslify: envMapEquirect = require('../local_modules/glsl-envmap-equirect');

      // uniform sampler2D uEnvMap;
      uniform samplerCube uEnvMap;
      uniform float uExposure;

      varying vec3 wcNormal;

      void main() {
          vec3 N = normalize(wcNormal);
          N.z *= -1.0;
          // vec3 color = texture2D(uEnvMap, envMapEquirect(N)).rgb;
          vec3 color = textureCube(uEnvMap, N).rgb;
          gl_FragColor.rgb = color;
          gl_FragColor.a = 1.0;
      }`
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

const resources = {
  negx: { image: `${ASSETS_DIR}/images/pisa/pisa_negx.jpg` },
  negy: { image: `${ASSETS_DIR}/images/pisa/pisa_negy.jpg` },
  negz: { image: `${ASSETS_DIR}/images/pisa/pisa_negz.jpg` },
  posx: { image: `${ASSETS_DIR}/images/pisa/pisa_posx.jpg` },
  posy: { image: `${ASSETS_DIR}/images/pisa/pisa_posy.jpg` },
  posz: { image: `${ASSETS_DIR}/images/pisa/pisa_posz.jpg` }
}

load(resources, (err, res) => {
  if (err) throw err

  const envMapCube = ctx.textureCube({
    data: [res.posx, res.negx, res.posy, res.negy, res.posz, res.negz],
    width: res.negx.width,
    height: res.negy.height,
    encoding: ctx.Encoding.SRGB
  })

  gui.addTextureCube('Cubemap', envMapCube, { flipEnvMap: -1 })

  drawSkybox.uniforms.uEnvMap = envMapCube
  drawCmd.uniforms.uEnvMap = envMapCube
  drawCmd.uniforms.uCameraPosition = camera.position

  raf(function frame() {
    ctx.submit(clearScreenCmd)
    ctx.submit(drawSkybox)
    ctx.submit(drawCmd)

    gui.draw()
    raf(frame)
  })
})
