# pex-context

Thin WebGL state stack and resource management wrapper for the pex library

# API

## Context creation

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

```javascript
var tex = ctx.texture2D({ data: Array, width: Number, height: Number, format: PixelFormat })

var tex = ctx.textureCube(Array of { data: Array, width: Number, height: Number, format: PixelFormat })

var buf = ctx.vertexBuffer({ data: Array }) // aka Attribute Buffer

var buf = ctx.elementsBuffer({ data: Array }) // aka Index Buffer

var pipeline = ctx.pipeline({
  vert: String,
  frag: String,
  // vertexLayout: { } // disabled ATM
  depthEnabled: Boolean,
  depthFunc: DepthFunc,
  blendEnabled: Boolean,
  blendSrcRGBFactor: BlendFactor,
  blendSrcAlphaFactor: BlendFactor,
  blendDstRGBFactor: BlendFactor,
  blendDstAlphaFactor: BlendFactor,
  cullFaceEnabled: Boolean,
  cullFace: Face
})

var pass = ctx.pass({
  color: Array of Texture2D | Array of { texture: Texture2D, target: Enum }
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
    name: { buffer: VertexBuffer, offset: Number }
    name:  VertexBuffer
  },
  elements: ElementsBuffer,
  elements: { buffer: ElementsBuffer, offset: Number },
  primitiveType: PrimitiveType,
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
  const DataType = {
    Float32: gl.FLOAT,
    Uint8: gl.UNSIGNED_BYTE,
    Uint16: gl.UNSIGNED_SHORT
  }
```

```
  const BlendFactor = {
    One: gl.ONE,
    Zero: gl.ZERO,
    SrcAlpha: gl.SRC_ALPHA,
    OneMinusSrcAlpha: gl.ONE_MINUS_SRC_ALPHA
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
  const Wrap = {
    ClampToEdge: gl.CLAMP_TO_EDGE,
    Repeat: gl.REPEAT
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

# Examples

To run e.g. shadow mapping example

```sh
cd examples
budo shadows.js --open --live -- -t glslify
```
