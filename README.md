# pex-context

Modern WebGL state wrapper for [PEX](http://pex.gl). With `pex-context` you allocate GPU resources (textures, buffers), setup state pipelines and passes and combine them together in commands.

# Example

```javascript
const createContext = require('pex-context')
const createCube = require('primitive-cube')
const Mat4 = require('pex-math/Mat4')

const ctx = createContext({ width: 640, height: 480 })
const cube = createCube()

const cmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1
  }),
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uViewMatrix;
      varying vec3 vNormal;
      void main () {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
        vNormal = aNormal;
      }
    `,
    frag: `
      precision mediump float;
      varying vec3 vNormal;
      void main () {
        gl_FragColor.rgb = vNormal;
        gl_FragColor.a = 1.0;
      }
    `
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(cube.positions),
    aNormal: ctx.vertexBuffer(cube.normals)
  },
  indices: ctx.indexBuffer(cube.cells),
  uniforms: {
    uProjectionMatrix: Mat4.perspective(Mat4.create(), 45, 640 / 480, 0.1, 100),
    uViewMatrix: Mat4.lookAt(Mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(cmd)
})
```

# API

## Context creation

Creating gl context wrapper.

```javascript
var createContext = require('pex-context')

// full window canvas
var ctx = createContext()

// creates gl context from existing canvas and keeps it's size
var ctx = createContext({ gl: gl })

// creates gl context from existing canvas and keeps it's size
var ctx = createContext({ canvas: canvas })

// creates new canvas with given width and height
var ctx = createContext({ width: Number, height: Number })
```

TODO: webgl2
```javascript
var ctx = createContext({ webgl2: true, width: Number, height: Number })
```

## Resource creation

### Textures

Textires represent pixel data uploaded to the GPU.

```javascript
var tex = ctx.texture2D({
  data: [255, 255, 255, 255, 0, 0, 0, 255],
  width: 2,
  height: 1,
  format: ctx.PixelFormat.RGB8,
  encoding: ctx.Encoding.Linear,
  wrap: ctx.Wrap.Repeat
})

var tex = ctx.textureCube([
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 }
])
```

| property | info | type | default |
| -------- | ---- | ---- | ------- |
| `data` | pixel data | Array, Uint8Array, Float32Array, HTMLCanvas, HTMLImage, HTMLVideo | null |
| `width` | texture width   | Number/Int | 0 |
| `height` | texture height  | Number/Int | 0 |
| `pixelFormat` | pixel data format | ctx.PixelFormat | ctx.PixelFormat.RGB8 |
| `encoding` | pixel data encoding | ctx.Encoding | ctx.Encoding.Linear |
| `wrapS` | wrapS mode | ctx.Wrap | ctx.Wrap.ClampToEdge |
| `wrapT` | wrapT mode | ctx.Wrap | ctx.Wrap.ClampToEdge |
| `wrap` | combines wrapS and wrapT | ctx.Wrap | ctx.Wrap.ClampToEdge |
| `min` | min filtering mode | ctx.Filter | ctx.Filter.Nearest |
| `mag` | mag filtering mode | ctx.Filter | ctx.Filter.Nearest |
| `aniso` | aniso level<sup>1</sup> | Number/Int | 0 |
| `mipmap` | generate mipmaps on update <sup>2</sup> | Boolean | false |
| `flipY` | flip pixel data on upload | Boolean | false |
| `name` | texture name for debugging | String | '' |
| `target` | texture target <sup>3</sup> | gl enum | gl.TEXTURE_2D or gl.TEXTURE_CUBE |

<sup>1</sup> requries [EXT_texture_filter_anisotropic](https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/)
<sup>2</sup> requires `min` to be set to `ctx.Filter.LinearMipmapLinear` or similar
<sup>3</sup> read only

### Buffers

```javascript
var buf = ctx.vertexBuffer({ data: Array }) // aka Attribute Buffer

var buf = ctx.indexBuffer({ data: Array }) // aka Index Buffer
```

### Pipelines

```javascript
var pipeline = ctx.pipeline({
  vert: String,
  frag: String,
  // vertexLayout: { } // disabled ATM
  depthWrite: Boolean, // true
  depthTest: Boolean,  // false
  depthFunc: DepthFunc, // LessEqual
  blendEnabled: Boolean, // false
  blendSrcRGBFactor: BlendFactor,
  blendSrcAlphaFactor: BlendFactor,
  blendDstRGBFactor: BlendFactor,
  blendDstAlphaFactor: BlendFactor,
  cullFaceEnabled: Boolean,
  cullFace: Face
})
```

### Passes

```javascript
var pass = ctx.pass({
  color: [Texture2D, ...]
  color: [{ texture: Texture2D | TextureCube, target: CubemapFace }, ...]
  depth: Texture2D
  clearColor: Array,
  clearDepth: Number
})
```

```
// WebGL 2
// var tex2DArray = ctx.texture2DArray()
// var tex3D = ctx.texture2D()
// var ubo = ctx.uniformBuffer()

```

## Resource update

```javascript
ctx.update(res, { data: Array })
```

## Command submission

```javascript
ctx.submit({
  pass: Pass
  pipeline: Pipeline,
  attributes: {
    name:  VertexBuffer,
    name: { buffer: VertexBuffer, offset: Number, stride: Number }
  },
  indices: IndexBuffer,
  indices: { buffer: IndexBuffer, offset: Number },
  primitive: Primitive,
  count: Number,
  instances: Number,
  uniforms: {
    name: Number,
    name: Array,
    name: Texture2D
  }
})
```

# Enums

```
  const BlendFactor = {
    One: gl.ONE,
    Zero: gl.ZERO,
    SrcAlpha: gl.SRC_ALPHA,
    OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA
  }
```

```
  const CubemapFace = {
    PositiveX: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    NegativeX: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    PositiveY: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    NegativeY: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    PositiveZ: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    NegativeZ: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
  }
```

```
  const DataType = {
    Float32: gl.FLOAT,
    Uint8: gl.UNSIGNED_BYTE,
    Uint16: gl.UNSIGNED_SHORT
  }
```

```
  const DepthFunc = {
    Never: gl.NEVER,
    Less: gl.LESS,
    Equal: gl.EQUAL,
    LessEqual: gl.LEQUAL,
    Greater: gl.GREATER,
    NotEqual: gl.NOTEQUAL,
    GreaterEqual: gl.GEQUAL,
    Always: gl.ALWAYS
  }
```

```
  const Face = {
    Front: gl.FRONT,
    Back: gl.BACK,
    FrontAndBack: gl.FRONT_AND_BACK
  }
```

```
  const PixelFormat = {
    RGBA8: 'rgba8', // gl.RGBA + gl.UNSIGNED_BYTE
    RGBA32F: 'rgba32f', // gl.RGBA + gl.FLOAT
    // RGBA16F: 'rgba16f', // gl.RGBA + gl.HALF_FLOAT
    R32F: 'r32f', //gl.ALPHA + gl.FLOAT
    // R16F: 'r16f', //gl.ALPHA + gl.HALF_FLOAT
    Depth: 'depth' // gl.DEPTH_COMPONENT
  }
```

```
  const Primitive = {
    Points: gl.POINTS,
    Lines: gl.LINES,
    LineStrip: gl.LINE_STRIP,
    Triangles: gl.TRIANGLES,
    TriangleStrip: gl.TRIANGLE_STRIP
  }
```

```
  const Wrap = {
    ClampToEdge: gl.CLAMP_TO_EDGE,
    Repeat: gl.REPEAT
  }
```

# Examples

To run e.g. shadow mapping example

```sh
cd examples
budo shadows.js --open --live -- -t glslify
```
