// Render to texture example
const createCube = require('primitive-cube')
const Mat4 = require('pex-math/Mat4')

const createContext = require('../../pex-context')
const raf = require('raf')
const createCamera = require('pex-cam/perspective')
const createOrbiter = require('pex-cam/orbiter')
const glsl = require('glslify')

const ctx = createContext()

const camera = createCamera({
  fov: 45, // TODO: change fov to radians
  aspect: 1,
  position: [3, 0.5, 3],
  target: [0, 0, 0],
  near: 2,
  far: 6
})

createOrbiter({ camera: camera, distance: 10 })

const depthMapSize = 1024
const depthMap = ctx.texture2D({
  width: depthMapSize,
  height: depthMapSize,
  format: ctx.PixelFormat.Depth
})

const colorMap = ctx.texture2D({ width: depthMapSize, height: depthMapSize })
const normalMap = ctx.texture2D({ width: depthMapSize, height: depthMapSize })
const colorMap2 = ctx.texture2D({ width: depthMapSize / 2, height: depthMapSize / 2 })

const clearScreenCmd = {
  name: 'clearScreen',
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1]
  })
}

const drawPassCmd = {
  name: 'drawPass',
  pass: ctx.pass({
    color: [ colorMap, normalMap ],
    depth: depthMap,
    clearColor: [1, 0, 0, 1],
    clearDepth: 1
  })
}

const drawPass2Cmd = {
  name: 'drawPass2',
  pass: ctx.pass({
    color: [ colorMap2 ],
    // depth: depthMap2,
    clearColor: [0, 0, 1, 1],
    clearDepth: 1
  })
}

const showNormalsVert = glsl(__dirname + '/glsl/show-normals.vert')

const showNormalsMRTFrag = `
#ifdef GL_ES
precision highp float;
#extension GL_EXT_draw_buffers : require 
#endif

varying vec4 vColor;

void main() {
  vec3 N = normalize(vColor.rgb * 2.0 - 1.0);
  vec3 L = normalize(vec3(1.0, 0.5, 0.2));
  gl_FragData[0].rgb = vec3(max(0.0, dot(N, L)));
  gl_FragData[0].a = 1.0;
  gl_FragData[1].rgb = N * 0.5 + 0.5;
  gl_FragData[1].a = 1.0;
}`

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
    vert: `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;

      varying vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `,
    frag: `
      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D uTexture;
      varying vec2 vTexCoord;
      void main () {
        gl_FragColor = texture2D(uTexture, vTexCoord);
      }
    `
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(quadPositions),
    aTexCoord: ctx.vertexBuffer(quadTexCoords)
  },
  indices: ctx.indexBuffer(quadFaces),
  uniforms: {
    uTexture: null
  }
}

let frameNumber = 0
raf(function frame () {
  ctx.debug(++frameNumber === 1)

  ctx.submit(clearScreenCmd)

  ctx.submit(drawPassCmd, {
    // viewport: [0, 0, 1024, 1024]
  }, () => {
    ctx.submit(drawFloorCmd)
  })

  ctx.submit(drawPass2Cmd, {
    // viewport: [0, 0, 512, 512]
  }, () => {
    ctx.submit(drawFloorCmd)
  })

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
