# pex-context

Modern WebGL state wrapper for [PEX](http://pex.gl). With `pex-context` you allocate GPU resources (textures, buffers), setup state pipelines and passes and combine them together into commands.

# Example

```javascript
const createContext = require('pex-context')
const createCube = require('primitive-cube')
const mat4 = require('pex-math/mat4')

const ctx = createContext({ width: 640, height: 480 })
const cube = createCube()

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
    uProjectionMatrix: mat4.perspective(mat4.create(), Math.PI / 4, 640 / 480, 0.1, 100),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd)
})
```

# API

## Context creation

Creating gl context wrapper.

### ctx = createContext(opts)

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

## Commands

Commands are plain javascript objects with GPU resources needed to complete a draw call

```javascript
var cmd = {
  pass: ctx.pass(..),
  pipeline: ctx.pipeline(..),
  attributes: [..]
}
```

## Submitting commands to the GPU

### ctx.submit(cmd)

```javascript
ctx.submit({
  pass: Pass
  pipeline: Pipeline,
  attributes: {
    name:  VertexBuffer,
    // or
    name: { buffer: VertexBuffer, offset: Number, stride: Number }
  },
  indices: IndexBuffer,
  // or
  indices: { buffer: IndexBuffer, offset: Number, count: Number },
  // or
  count: Number,
  instances: Number,
  uniforms: {
    name: Number,
    name: Array,
    name: Texture2D
  }
})
```

### ctx.submit(cmd, opts)

Submit partially updated command without modifying the original one

```javascript
// E.g. draw mesh with custom color
ctx.submit(cmd, {
  uniforms: {
    uColor: [1, 0, 0, 0]
  }
})
```

### ctx.submit(cmd, [opts1, opts2, opts3...])

Submit a batch of commands differences in opts.

```javascript
// E.g. draw same mesh twice with different material and position
ctx.submit(cmd, [
  { pipeline: material1, uniforms: { uModelMatrix: position1 },
  { pipeline: material2, uniforms: { uModelMatrix: position2 }
])
```


## Subcommands

#### ctx.submit(cmd, cb)

Submit command while preserving state from another command.

This approach allows to simulate state stack with automatic cleanup at the end of callback.

```javascript
// E.g. render to texture
ctx.submit(renderToFboCmd, () => {
  ctx.submit(drawMeshCmd)
})
```
## Render Loop

#### ctx.frame(cb)

- `cb`: Function - Request Animation Frame callack

## Resource creation

### Textures

Textures represent pixel data uploaded to the GPU.

#### texture = ctx.texture2D(opts)

```javascript
var tex = ctx.texture2D({
  data: [255, 255, 255, 255, 0, 0, 0, 255],
  width: 2,
  height: 1,
  pixelFormat: ctx.PixelFormat.RGB8,
  encoding: ctx.Encoding.Linear,
  wrap: ctx.Wrap.Repeat
})
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
| `aniso` | aniso level <sup>1</sup> | Number/Int | 0 |
| `mipmap` | generate mipmaps on update <sup>2</sup> | Boolean | false |
| `flipY` | flip pixel data on upload | Boolean | false |
| `name` | texture name for debugging | String | '' |
| `target` | texture target <sup>3</sup> | gl enum | gl.TEXTURE_2D or gl.TEXTURE_CUBE |

<sup>1</sup> requries [EXT_texture_filter_anisotropic](https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/)  
<sup>2</sup> requires `min` to be set to `ctx.Filter.LinearMipmapLinear` or similar  
<sup>3</sup> read only

#### texture = ctx.textureCube(opts)

- `opts`: Object - see `ctx.texture2D(opts)`

```javascript
var tex = ctx.textureCube([
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 },
  { data: new Uint8Array([..]), width: 64, height: 64 }
])
```
### Buffers

#### buffer = ctx.vertexBuffer(opts)
#### buffer = ctx.indexBuffer(opts)

```javascript
var buf = ctx.vertexBuffer({ data: Array }) // aka Attribute Buffer

var buf = ctx.indexBuffer({ data: Array }) // aka Index Buffer
```

| property | info | type | default |
| -------- | ---- | ---- | ------- |
| `data` | pixel data | Array, Uint8Array, Float32Array | null |
| `type` | data type | ctx.DataType | ctx.DataType.Float32 |
| `usage` | buffer usage | ctx.Usage | ctx.Usage.StaticDraw |

### Pipelines

#### pipeline = ctx.pipeline(opts)

```javascript
var pipeline = ctx.pipeline({
  vert: String,
  frag: String,
  depthWrite: Boolean, // true
  depthTest: Boolean,  // false
  depthFunc: DepthFunc, // LessEqual
  blend: Boolean, // false
  blendSrcRGBFactor: BlendFactor,
  blendSrcAlphaFactor: BlendFactor,
  blendDstRGBFactor: BlendFactor,
  blendDstAlphaFactor: BlendFactor,
  cullFace: Boolean,
  cullFaceMode: Face,
  primitive: Primitive
})
```

### Passes

#### pass = ctx.pass(opts)

```javascript
var pass = ctx.pass({
  color: [Texture2D, ...]
  color: [{ texture: Texture2D | TextureCube, target: CubemapFace }, ...]
  depth: Texture2D
  clearColor: Array,
  clearDepth: Number
})
```

### Queries

#### query = ctx.query(opts)

*Note: Requires EXT_disjoint_timer_query*

```javascript
var query = ctx.query({
  target: QueryTarget
})
```

| property | info | type | default |
| -------- | ---- | ---- | ------- |
| `target` | query type | ctx.QueryTarget | ctx.QueryTarget.TimeElapsed |
| `state` | query state | ctx.QueryState | ctx.QueryState.Ready |
| `result` | result of the measurement | Number | null |

#### ctx.beginQuery(q)

Begin the query measurement.

*Note: There can be only one query running at the time.*

#### ctx.endQuery(q)

End the query measurement. 

*Note: The result is not available immediately and will be `null` until the state changes from `ctx.QueryState.Pending` to `ctx.QueryState.Ready`*

## Updating resources

#### ctx.update(res, opts)

```javascript
ctx.update(res, { data: Array })
```

# Enums

#### ctx.BlendFactor

```
  const BlendFactor = {
    One: gl.ONE,
    Zero: gl.ZERO,
    SrcAlpha: gl.SRC_ALPHA,
    OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA
  }
```

#### ctx.CubemapFace

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

#### ctx.DataType

```
  const DataType = {
    Float32: gl.FLOAT,
    Uint8: gl.UNSIGNED_BYTE,
    Uint16: gl.UNSIGNED_SHORT,
    Uint32: gl.UNSIGNED_INT
  }
```

#### ctx.DepthFunc

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

#### ctx.Face

```
  const Face = {
    Front: gl.FRONT,
    Back: gl.BACK,
    FrontAndBack: gl.FRONT_AND_BACK
  }
```

#### ctx.PixelFormat

```
  const PixelFormat = {
    RGBA8: 'rgba8', // gl.RGBA + gl.UNSIGNED_BYTE
    RGBA32F: 'rgba32f', // gl.RGBA + gl.FLOAT
    RGBA16F: 'rgba16f', // gl.RGBA + gl.HALF_FLOAT
    R32F: 'r32f', // gl.ALPHA + gl.FLOAT
    R16F: 'r16f', // gl.ALPHA + gl.HALF_FLOAT
    Depth: 'depth' // gl.DEPTH_COMPONENT
  }
```

#### ctx.Primitive

```
  const Primitive = {
    Points: gl.POINTS,
    Lines: gl.LINES,
    LineStrip: gl.LINE_STRIP,
    Triangles: gl.TRIANGLES,
    TriangleStrip: gl.TRIANGLE_STRIP
  }
```

#### ctx.Wrap

```
  const Wrap = {
    ClampToEdge: gl.CLAMP_TO_EDGE,
    Repeat: gl.REPEAT
  }
```

#### ctx.QueryTarget

```
  const QueryTarget = {
    TimeElapsed: gl.TIME_ELAPSED
  }
```

#### ctx.QueryState

```
  const QueryState = {
    Ready: 'ready',
    Active: 'active',
    Pending: 'pending'
  }
```

# Examples

To run e.g. shadow mapping example

```sh
cd examples
budo shadows.js --open --live -- -t glslify
```
