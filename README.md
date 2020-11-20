# pex-context

Modern WebGL state wrapper for [PEX](http://pex.gl). With `pex-context` you allocate GPU resources (textures, buffers), setup state pipelines and passes and combine them together into commands.

- [Example](#example)
- [Code examples](#code-examples)
- [Context](#context)
- [Render loop](#render-loop)
- [Commands](#commands)
- [Resources](#resources)
  - [Pass](#pass)
  - [Pipeline](#pipeline)
  - [Texture](#texture)
  - [Renderbuffer](#renderbuffer)
  - [Buffer](#buffer)
  - [Query](#query)
- [Updating resources](#updating-resources)
- [Enums](#enums)

# Example

```js
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
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      640 / 480,
      0.1,
      100
    ),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0])
  }
}

ctx.frame(() => {
  ctx.submit(clearCmd)
  ctx.submit(drawCmd)
})
```

You can find runnable examples in the /examples folder in this repository. To run an example install Node.js, clone or download this repository and then run:

```sh
# go to the example folder
cd examples

# install examples dependencies
npm i

# run the example in your default browser window
npx budo example-name.js --open --start
```

# API

## Context

Creating gl context wrapper.

#### ctx = createContext(opts)

```js
const createContext = require('pex-context')

// full window canvas
const ctx = createContext()

// creates gl context from existing canvas and keeps it's size
const ctx = createContext({ gl: gl })

// creates gl context from existing canvas and keeps it's size
const ctx = createContext({ canvas: canvas })

// creates new canvas with given width and height
const ctx = createContext({ width: Number, height: Number })
```

#### ctx.set(opts)

```js
ctx.set({
  pixelRatio: 2,
  width: 1280,
  height: 720,
  debug: true
})
```

| property     | info                                                            | default |
| ------------ | --------------------------------------------------------------- | ------- |
| `pixelRatio` | canvas resolution, can't be bigger than window.devicePixelRatio | 1       |
| `width`      | canvas width                                                    | -       |
| `height`     | canvas height                                                   | -       |
| `debug`      | turn on/off debug mode with log package                         | -       |

Note 1: The new size and resolution will be applied not immediately but before drawing the next frame to avoid flickering.

Note 2: Context's canvas doesn't resize automatically, even if you skip width/height on init and the canvas will be asigned dimensions of the window. To handle resizing use the following code:

```js
window.addEventListener('resize', () => {
  ctx.set({
    width: window.innerWidth,
    height: window.innerWidth
  })
})
```

## Render Loop

#### ctx.frame(cb)

- `cb`: Function - Request Animation Frame callback

## Commands

Commands are plain js objects with GPU resources needed to complete a draw call

```js
const cmd = {
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
  },
  viewport: [0, 0, 1920, 1080],
  scissor: [0, 0, 1920, 1080]
}
```

| property     | info                       | type                                                                                       |
| ------------ | -------------------------- | ------------------------------------------------------------------------------------------ |
| `pass`       | render pass info           | ctx.Pass                                                                                   |
| `pipeline`   | rendering pipeline info    | ctx.Pipeline                                                                               |
| `attributes` | vertex attributes          | map of :                                                                                   |
|              |                            | `attibuteName: ctx.VertexBuffer`                                                           |
|              |                            | `attributeName: { buffer: VertexBuffer, offset: Number, stride: Number, divisor: Number }` |
| `indices`    | indices                    | either:                                                                                    |
|              |                            | `ctx.IndexBuffer`                                                                          |
|              |                            | `{ buffer: IndexBuffer, offset: Number, stride: Number }`                                  |
| `count`      | number of vertices to draw | Integer                                                                                    |
| `instances`  | number instances to draw   | Integer                                                                                    |
| `uniforms`   | shader uniforms            | map of `name: value`                                                                       |
| `viewport`   | drawing viewport bounds    | [x, y, w, h]                                                                               |
| `scissor`    | scissor test bounds        | [x, y, w, h]                                                                               |

_Note: either indices or count need to be specified when drawing geometry_
_Note: scissor region is by default set to null and scissor test disabled_

## Submitting commands to the GPU

#### ctx.submit(cmd)

```js
ctx.submit({
  pass: ctx.pass({
    clearColor: [1, 0, 0, 1]
  }),
  pipeline: ctx.pipeline({
    vert: '...',
    frag: '...'
  }),
  attributes: {...},
  indices: indexBuffer,
  uniforms: {...},
  ...
})
```

#### ctx.submit(cmd, opts)

Submit partially updated command without modifying the original one

```js
// E.g. draw mesh with custom color
ctx.submit(cmd, {
  uniforms: {
    uColor: [1, 0, 0, 0]
  }
})
```

#### ctx.submit(cmd, [opts1, opts2, opts3...])

Submit a batch of commands differences in opts.

```js
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

```js
// E.g. render to texture
ctx.submit(renderToFboCmd, () => {
  ctx.submit(drawMeshCmd)
})
```

## Resources

All resources are plain js object and once constructed their properties can be accessed directly.
Please note those props are read only. To set new values or upload new data to GPU see [updating resources](#updating-resources).

```js
const tex = ctx.texture2D({
  width: 256,
  pixelFormat: ctx.PixelFormat.RGBA8
})

tex.width //256
tex.pixelFormat //'rgba8'

//but also those properties has been added
tex.type //gl.UNSIGNED_BYTE
tex.internalFormat //gl.RGBA
```

### Pass

Passes are responsible for setting render targets (textures) and their clearing values.
FBOs are created internally and automatically by pex-context.

#### pass = ctx.pass(opts)

```js
const pass = ctx.pass({
  color: [Texture2D, ...]
  color: [{ texture: Texture2D | TextureCube, target: CubemapFace }, ...]
  depth: Texture2D
  clearColor: Array,
  clearDepth: Number
})
```

| property     | info                | type                                           | default |
| ------------ | ------------------- | ---------------------------------------------- | ------- |
| `color`      | color render target | Array of Texture2D or { texture, target} pairs | null    |
| `depth`      | depth render target | Texture2D                                      | null    |
| `clearColor` | clear color value   | Array                                          | null    |
| `clearDepth` | clear depth value   | Number                                         | null    |

### Pipeline

Pipelines represent the state of the GPU rendering pipeline (shaders, blending, depth test etc).

#### pipeline = ctx.pipeline(opts)

```js
const pipeline = ctx.pipeline({
  vert: String,
  frag: String,
  depthWrite: Boolean,
  depthTest: Boolean,
  depthFunc: DepthFunc,
  blend: Boolean,
  blendSrcRGBFactor: BlendFactor,
  blendSrcAlphaFactor: BlendFactor,
  blendDstRGBFactor: BlendFactor,
  blendDstAlphaFactor: BlendFactor,
  cullFace: Boolean,
  cullFaceMode: Face,
  colorMask: Array,
  primitive: Primitive
})
```

| property              | info                              | type             | default                  |
| --------------------- | --------------------------------- | ---------------- | ------------------------ |
| `vert`                | vertex shader code                | String           | null                     |
| `frag`                | fragment shader code              | String           | null                     |
| `depthWrite`          | depth write mask                  | Boolean          | true                     |
| `depthTest`           | depth test on/off                 | Boolean          | false                    |
| `depthFunc`           | depth test function               | DepthFunc        | LessEqual                |
| `blend`               | blending on/off                   | Boolean          | false                    |
| `blendSrcRGBFactor`   | blending source color factor      | BlendFactor      | One                      |
| `blendSrcAlphaFactor` | blending source alpha factor      | BlendFactor      | One                      |
| `blendDstRGBFactor`   | blending destination color factor | BlendFactor      | One                      |
| `blendDstAlphaFactor` | blending destination alpha factor | BlendFactor      | One                      |
| `cullFace`            | face culling on/off               | Boolean          | false                    |
| `cullFaceMode`        | face culling mode                 | Face             | Back                     |
| `colorMask`           | color write mask for [r, g, b, a] | Array of Boolean | [true, true, true, true] |
| `primitive`           | geometry primitive                | Primitive        | Triangles                |

### Texture

Textures represent pixel data uploaded to the GPU.

#### texture = ctx.texture2D(opts)

```js
const tex = ctx.texture2D({
  data: [255, 255, 255, 255, 0, 0, 0, 255],
  width: 2,
  height: 1,
  pixelFormat: ctx.PixelFormat.RGB8,
  encoding: ctx.Encoding.Linear,
  wrap: ctx.Wrap.Repeat
})
```

| property      | info                                    | type                                                              | default                          |
| ------------- | --------------------------------------- | ----------------------------------------------------------------- | -------------------------------- |
| `data`        | pixel data                              | Array, Uint8Array, Float32Array, HTMLCanvas, HTMLImage, HTMLVideo | null                             |
| `width`       | texture width                           | Number/Int                                                        | 0                                |
| `height`      | texture height                          | Number/Int                                                        | 0                                |
| `pixelFormat` | pixel data format                       | ctx.PixelFormat                                                   | ctx.PixelFormat.RGB8             |
| `encoding`    | pixel data encoding                     | ctx.Encoding                                                      | ctx.Encoding.Linear              |
| `wrapS`       | wrapS mode                              | ctx.Wrap                                                          | ctx.Wrap.ClampToEdge             |
| `wrapT`       | wrapT mode                              | ctx.Wrap                                                          | ctx.Wrap.ClampToEdge             |
| `wrap`        | combines wrapS and wrapT                | ctx.Wrap                                                          | ctx.Wrap.ClampToEdge             |
| `min`         | min filtering mode                      | ctx.Filter                                                        | ctx.Filter.Nearest               |
| `mag`         | mag filtering mode                      | ctx.Filter                                                        | ctx.Filter.Nearest               |
| `aniso`       | aniso level <sup>1</sup>                | Number/Int                                                        | 0                                |
| `mipmap`      | generate mipmaps on update <sup>2</sup> | Boolean                                                           | false                            |
| `flipY`       | flip pixel data on upload               | Boolean                                                           | false                            |
| `name`        | texture name for debugging              | String                                                            | ''                               |
| `target`      | texture target <sup>3</sup>             | gl enum                                                           | gl.TEXTURE_2D or gl.TEXTURE_CUBE |

<sup>1</sup> requries [EXT_texture_filter_anisotropic](https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/)
<sup>2</sup> requires `min` to be set to `ctx.Filter.LinearMipmapLinear` or similar
<sup>3</sup> read only

#### texture = ctx.textureCube(opts)

- `opts`: Object - see `ctx.texture2D(opts)`
- `opts.data`: Array of Images or TypedArrays - 6 images, one for each face +X, -X, +Y, -Y, +Z, -Z

```js
const tex = ctx.textureCube({
  data: [ posx, negx, posy, negy, posz, negz ],
  width: 64,
  height: 64
])
```

### Renderbuffer

Renderbuffers represent pixel data store for rendering operations

#### renderbuffer = ctx.renderbuffer(opts)

```js
const tex = ctx.renderbuffer({
  width: 1280,
  height: 720,
  pixelFormat: ctx.PixelFormat.Depth16
})
```

| property      | info                          | type            | default |
| ------------- | ----------------------------- | --------------- | ------- |
| `width`       | renderbuffer width            | Number/Int      | 0       |
| `height`      | renderbuffer height           | Number/Int      | 0       |
| `pixelFormat` | pixel data format<sup>1</sup> | ctx.PixelFormat | null    |

<sup>1</sup> only `PixelFormat.Depth16` equal to `gl.DEPTH_COMPONENT16` is currently supported for use as render pass depth storage (e.g. `ctx.pass({ depth: renderbuffer})`) for platforms with no `WEBGL_depth_texture` support.

### Buffer

Buffers store vertex and index data in the GPU memory.

#### buffer = ctx.vertexBuffer(opts)

#### buffer = ctx.indexBuffer(opts)

```js
const buf = ctx.vertexBuffer({ data: Array }) // aka Attribute Buffer

const buf = ctx.indexBuffer({ data: Array }) // aka Index Buffer
```

| property | info         | type                            | default              |
| -------- | ------------ | ------------------------------- | -------------------- |
| `data`   | pixel data   | Array, Uint8Array, Float32Array | null                 |
| `type`   | data type    | ctx.DataType                    | ctx.DataType.Float32 |
| `usage`  | buffer usage | ctx.Usage                       | ctx.Usage.StaticDraw |
| `offset` | data offset in the buffer (update only) | Number/Int      | undefined |

### Query

Queries are used for GPU timers.

#### query = ctx.query(opts)

_Note: Requires EXT_disjoint_timer_query_

```js
const query = ctx.query({
  target: QueryTarget
})
```

| property | info                      | type            | default                     |
| -------- | ------------------------- | --------------- | --------------------------- |
| `target` | query type                | ctx.QueryTarget | ctx.QueryTarget.TimeElapsed |
| `state`  | query state               | ctx.QueryState  | ctx.QueryState.Ready        |
| `result` | result of the measurement | Number          | null                        |

#### ctx.beginQuery(q)

Begin the query measurement.

_Note: There can be only one query running at the time._

#### ctx.endQuery(q)

End the query measurement.

_Note: The result is not available immediately and will be `null` until the state changes from `ctx.QueryState.Pending` to `ctx.QueryState.Ready`_

## Updating resources

#### ctx.update(res, opts)

Update a resource.

```js
ctx.update(res, { data: [] })

const tex = ctx.texture2D({...})
ctx.update(tex, {
  width: 1,
  height: 1,
  data: new Uint8Array([255, 0, 0, 255])
})
```

| property | info                                                    | type                                                                                     |
| -------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `res`    | resource to be updated                                  | ctx.Buffer, ctx.Framebuffer, ctx.Pass, ctx.Pipeline, ctx.Program, ctx.Query, ctx.Texture |
| `opts`   | whatever data the given resource accepts in constructor | Object                                                                                   |

## Disposing resources

#### ctx.dispose()

Delete all allocated resources and stop render loop. Disposed context is no longer valid to use.

```js
ctx.dispose()
```

#### ctx.dispose(res)

Delete a resource. Disposed resource is no longer valid for use.

```js
const tex = ctx.texture2D({})
...
ctx.dispose(tex)
```

| property | info                   | type                                                                                     |
| -------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `res`    | resource to be deleted | ctx.Buffer, ctx.Framebuffer, ctx.Pass, ctx.Pipeline, ctx.Program, ctx.Query, ctx.Texture |

_Note: Framebuffers are ref counted and released by Pass, Programs are also ref counted and released by Pipeline_

## Capabilities

Get capabilities and extensions availability.

```js
const maxTextureSize = ctx.maxTextureSize
```

| property                     | info                                                                                         | type    |
| ---------------------------- | -------------------------------------------------------------------------------------------- | ------- |
| `maxColorAttachments`        | gl.getParameter('MAX_COLOR_ATTACHMENTS') or gl.getParameter(ext.MAX_COLOR_ATTACHMENTS_WEBGL) | Number  |
| `maxTextureImageUnits`       | gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)                                                  | Number  |
| `maxVertexTextureImageUnits` | gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)                                           | Number  |
| `maxTextureSize`             | gl.getParameter(gl.MAX_TEXTURE_SIZE)                                                         | Number  |
| `maxCubeMapTextureSize`      | gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)                                                | Number  |
| `instancedArrays`            | false                                                                                        | Boolean |
| `instancing`                 | false (deprecated)                                                                           | Boolean |
| `elementIndexUint32`         | !!gl.getExtension('OES_element_index_uint')                                                  | Boolean |
| `standardDerivatives`        | !!gl.getExtension('OES_standard_derivatives')                                                | Boolean |
| `depthTexture`               | !!gl.getExtension('WEBGL_depth_texture')                                                     | Boolean |
| `shaderTextureLod`           | !!gl.getExtension('EXT_shader_texture_lod')                                                  | Boolean |
| `textureFloat`               | !!gl.getExtension('OES_texture_float')                                                       | Boolean |
| `textureFloatLinear`         | !!gl.getExtension('OES_texture_float_linear')                                                | Boolean |
| `textureHalfFloat`           | !!gl.getExtension('OES_texture_half_float')                                                  | Boolean |
| `textureHalfFloatLinear`     | !!gl.getExtension('OES_texture_half_float_linear')                                           | Boolean |
| `textureFilterAnisotropic`   | !!gl.getExtension('EXT_texture_filter_anisotropic')                                          | Boolean |

# Enums

#### ctx.BlendFactor

```js
const BlendFactor = {
  One: gl.ONE,
  Zero: gl.ZERO,
  SrcAlpha: gl.SRC_ALPHA,
  OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA,
  DstAlpha: gl.DST_ALPHA,
  OneMinusDstAlpha: gl.ONE_MINUS_DST_ALPHA,
  SrcColor: gl.SRC_COLOR,
  OneMinusSrcColor: gl.ONE_MINUS_SRC_COLOR,
  DstColor: gl.DST_COLOR,
  OneMinusDstColor: gl.ONE_MINUS_DST_COLOR
}
```

#### ctx.CubemapFace

```js
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

```js
const DataType = {
  Float32: gl.FLOAT,
  Uint8: gl.UNSIGNED_BYTE,
  Uint16: gl.UNSIGNED_SHORT,
  Uint32: gl.UNSIGNED_INT
}
```

#### ctx.DepthFunc

```js
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

```js
const Face = {
  Front: gl.FRONT,
  Back: gl.BACK,
  FrontAndBack: gl.FRONT_AND_BACK
}
```

#### ctx.PixelFormat

```js
const PixelFormat = {
  RGBA8: 'rgba8', // gl.RGBA + gl.UNSIGNED_BYTE
  RGBA32F: 'rgba32f', // gl.RGBA + gl.FLOAT
  RGBA16F: 'rgba16f', // gl.RGBA + gl.HALF_FLOAT
  R32F: 'r32f', // gl.ALPHA + gl.FLOAT
  R16F: 'r16f', // gl.ALPHA + gl.HALF_FLOAT
  Depth: 'depth', // gl.DEPTH_COMPONENT + gl.UNSIGNED_SHORT
  Depth16: 'depth16', // gl.DEPTH_COMPONENT + gl.UNSIGNED_SHORT
  Depth24: 'depth24' // gl.DEPTH_COMPONENT + gl.UNSIGNED_INT
}
```

#### ctx.Primitive

```js
const Primitive = {
  Points: gl.POINTS,
  Lines: gl.LINES,
  LineStrip: gl.LINE_STRIP,
  Triangles: gl.TRIANGLES,
  TriangleStrip: gl.TRIANGLE_STRIP
}
```

#### ctx.Encoding

```js
const Encoding = {
  Linear: 1,
  Gamma: 2,
  SRGB: 3,
  RGBM: 4
}
```

#### ctx.Usage

```js
const Usage = {
  StaticDraw: gl.STATIC_DRAW,
  DynamicDraw: gl.DYNAMIC_DRAW,
  StreamDraw: gl.STREAM_DRAW
}
```

#### ctx.Wrap

```js
const Wrap = {
  ClampToEdge: gl.CLAMP_TO_EDGE,
  Repeat: gl.REPEAT
}
```

#### ctx.QueryTarget

```js
const QueryTarget = {
  TimeElapsed: gl.TIME_ELAPSED
}
```

#### ctx.QueryState

```js
const QueryState = {
  Ready: 'ready',
  Active: 'active',
  Pending: 'pending'
}
```

## License

MIT, see [LICENSE.md](https://github.com/pex-gl/pex-context/blob/master/LICENSE.md) for details.
