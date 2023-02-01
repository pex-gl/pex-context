# pex-context

[![npm version](https://img.shields.io/npm/v/pex-context)](https://www.npmjs.com/package/pex-context)
[![stability-stable](https://img.shields.io/badge/stability-stable-green.svg)](https://www.npmjs.com/package/pex-context)
[![npm minzipped size](https://img.shields.io/bundlephobia/minzip/pex-context)](https://bundlephobia.com/package/pex-context)
[![dependencies](https://img.shields.io/librariesio/release/npm/pex-context)](https://github.com/pex-gl/pex-context/blob/main/package.json)
[![types](https://img.shields.io/npm/types/pex-context)](https://github.com/microsoft/TypeScript)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-fa6673.svg)](https://conventionalcommits.org)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![license](https://img.shields.io/github/license/pex-gl/pex-context)](https://github.com/pex-gl/pex-context/blob/main/LICENSE.md)

Modern WebGL state wrapper for [PEX](https://pex.gl): allocate GPU resources (textures, buffers), setup state pipelines and passes, and combine them into commands.

![](https://raw.githubusercontent.com/pex-gl/pex-context/main/screenshot.gif)

## Installation

```bash
npm install pex-context
```

## Usage

```js
import createContext from "pex-context";

import { mat4 } from "pex-math";
import { cube } from "primitive-geometry";

const W = 640;
const H = 480;
const ctx = createContext({ width: W, height: H });

const geom = cube();

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: /* glsl */ `
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec4 vColor;

void main () {
  vColor = vec4(aNormal * 0.5 + 0.5, 1.0);

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}
`,
    frag: /* glsl */ `
precision highp float;

varying vec4 vColor;

void main() {
  gl_FragColor = vColor;
}
`,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      W / H,
      0.1,
      100
    ),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0]),
  },
};

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawCmd);
});
```

## API

<!-- api-start -->

## Objects

<dl>
<dt><a href="#ctx">ctx</a> : <code>object</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createContext">createContext([options])</a> ⇒ <code><a href="#ctx">ctx</a></code></dt>
<dd><p>Create a context object</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#BufferOptions">BufferOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#Attachment">Attachment</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PassOptions">PassOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#PipelineOptions">PipelineOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#QueryOptions">QueryOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#PexQuery">PexQuery</a> : <code><a href="#QueryOptions">QueryOptions</a></code></dt>
<dd></dd>
<dt><a href="#RenderbufferOptions">RenderbufferOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#TextureOptionsData">TextureOptionsData</a> : <code>HTMLImageElement</code> | <code>HTMLVideoElement</code> | <code>HTMLCanvasElement</code></dt>
<dd></dd>
<dt><a href="#TextureTarget">TextureTarget</a> : <code>WebGLRenderingContext.TEXTURE_2D</code> | <code>WebGLRenderingContext.TEXTURE_CUBE_MAP</code></dt>
<dd></dd>
<dt><a href="#TextureOptions">TextureOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
<dt><a href="#TextureCubeOptions">TextureCubeOptions</a> : <code>TextureCube</code></dt>
<dd></dd>
<dt><a href="#PexContextOptions">PexContextOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PexResource">PexResource</a> : <code>Object</code></dt>
<dd><p>All resources are plain js object and once constructed their properties can be accessed directly.
Please note those props are read only. To set new values or upload new data to GPU see <a href="context~update">updating resources</a>.</p>
</dd>
<dt><a href="#PexCommand">PexCommand</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#PexContextSetOptions">PexContextSetOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#Viewport">Viewport</a> : <code>Array.&lt;number&gt;</code></dt>
<dd><p>[x, y, w, h]</p>
</dd>
<dt><a href="#Color">Color</a> : <code>Array.&lt;number&gt;</code></dt>
<dd><p>[r, g, b, a]</p>
</dd>
<dt><a href="#VertexArrayOptions">VertexArrayOptions</a> : <code><a href="#PexResource">PexResource</a></code></dt>
<dd></dd>
</dl>

<a name="ctx"></a>

## ctx : <code>object</code>

**Kind**: global namespace

- [ctx](#ctx) : <code>object</code>
  - [.gl](#ctx.gl)
  - [.capabilities](#ctx.capabilities)
  - [.width](#ctx.width)
  - [.height](#ctx.height)
  - [.BlendFactor](#ctx.BlendFactor)
  - [.CubemapFace](#ctx.CubemapFace)
  - [.DepthFunc](#ctx.DepthFunc)
  - [.Face](#ctx.Face)
  - [.Filter](#ctx.Filter)
  - [.TextureFormat](#ctx.TextureFormat)
  - [.PixelFormat](#ctx.PixelFormat)
  - [.RenderbufferFloatFormat](#ctx.RenderbufferFloatFormat)
  - [.Encoding](#ctx.Encoding)
  - [.Primitive](#ctx.Primitive)
  - [.Usage](#ctx.Usage)
  - [.Wrap](#ctx.Wrap)
  - [.QueryTarget](#ctx.QueryTarget)
  - [.QueryState](#ctx.QueryState)
  - [.set(options)](#ctx.set)
  - [.debug([enabled])](#ctx.debug)
  - [.frame(cb)](#ctx.frame)
  - [.submit(cmd, [optsBatchesOrSubCommand], [subCommand])](#ctx.submit)
  - [.pass(opts)](#ctx.pass) ⇒ [<code>PexResource</code>](#PexResource)
  - [.pipeline(opts)](#ctx.pipeline) ⇒ [<code>PexResource</code>](#PexResource)
  - [.vertexArray(opts)](#ctx.vertexArray) ⇒ [<code>PexResource</code>](#PexResource)
  - [.texture2D(opts)](#ctx.texture2D) ⇒ [<code>PexResource</code>](#PexResource)
  - [.textureCube(opts)](#ctx.textureCube) ⇒ [<code>PexResource</code>](#PexResource)
  - [.renderbuffer(opts)](#ctx.renderbuffer) ⇒ [<code>PexResource</code>](#PexResource)
  - [.vertexBuffer(opts)](#ctx.vertexBuffer) ⇒ [<code>PexResource</code>](#PexResource)
  - [.indexBuffer(opts)](#ctx.indexBuffer) ⇒ [<code>PexResource</code>](#PexResource)
  - [.query(opts)](#ctx.query) ⇒ [<code>PexResource</code>](#PexResource)
  - [.beginQuery(query)](#ctx.beginQuery)
  - [.endQuery(query)](#ctx.endQuery)
  - [.readPixels(viewport)](#ctx.readPixels) ⇒ <code>Uint8Array</code>
  - [.update(resource, opts)](#ctx.update)
  - [.dispose([resource])](#ctx.dispose)

<a name="ctx.gl"></a>

### ctx.gl

The `RenderingContext` returned by `pex-gl`

**Kind**: static property of [<code>ctx</code>](#ctx)
<a name="ctx.capabilities"></a>

### ctx.capabilities

Max capabilities and extensions availability. See [Capabilities Table](#capabilitiesTable).

**Kind**: static property of [<code>ctx</code>](#ctx)
<a name="ctx.width"></a>

### ctx.width

Getter for `gl.drawingBufferWidth`

**Kind**: static property of [<code>ctx</code>](#ctx)
<a name="ctx.height"></a>

### ctx.height

Getter for `gl.drawingBufferHeight`

**Kind**: static property of [<code>ctx</code>](#ctx)
<a name="ctx.BlendFactor"></a>

### ctx.BlendFactor

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name             | Default                             |
| ---------------- | ----------------------------------- |
| One              | <code>gl.ONE</code>                 |
| Zero             | <code>gl.ZERO</code>                |
| SrcAlpha         | <code>gl.SRC_ALPHA</code>           |
| OneMinusSrcAlpha | <code>gl.ONE_MINUS_SRC_ALPHA</code> |
| DstAlpha         | <code>gl.DST_ALPHA</code>           |
| OneMinusDstAlpha | <code>gl.ONE_MINUS_DST_ALPHA</code> |
| SrcColor         | <code>gl.SRC_COLOR</code>           |
| OneMinusSrcColor | <code>gl.ONE_MINUS_SRC_COLOR</code> |
| DstColor         | <code>gl.DST_COLOR</code>           |
| OneMinusDstColor | <code>gl.ONE_MINUS_DST_COLOR</code> |

<a name="ctx.CubemapFace"></a>

### ctx.CubemapFace

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name      | Default                                     |
| --------- | ------------------------------------------- |
| PositiveX | <code>gl.TEXTURE_CUBE_MAP_POSITIVE_X</code> |
| NegativeX | <code>gl.TEXTURE_CUBE_MAP_NEGATIVE_X</code> |
| PositiveY | <code>gl.TEXTURE_CUBE_MAP_POSITIVE_Y</code> |
| NegativeY | <code>gl.TEXTURE_CUBE_MAP_NEGATIVE_Y</code> |
| PositiveZ | <code>gl.TEXTURE_CUBE_MAP_POSITIVE_Z</code> |
| NegativeZ | <code>gl.TEXTURE_CUBE_MAP_NEGATIVE_Z</code> |

<a name="ctx.DepthFunc"></a>

### ctx.DepthFunc

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name         | Default                  |
| ------------ | ------------------------ |
| Never        | <code>gl.NEVER</code>    |
| Less         | <code>gl.LESS</code>     |
| Equal        | <code>gl.EQUAL</code>    |
| LessEqual    | <code>gl.LEQUAL</code>   |
| Greater      | <code>gl.GREATER</code>  |
| NotEqual     | <code>gl.NOTEQUAL</code> |
| GreaterEqual | <code>gl.GEQUAL</code>   |
| Always       | <code>gl.ALWAYS</code>   |

<a name="ctx.Face"></a>

### ctx.Face

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name         | Default                        |
| ------------ | ------------------------------ |
| Front        | <code>gl.FRONT</code>          |
| Back         | <code>gl.BACK</code>           |
| FrontAndBack | <code>gl.FRONT_AND_BACK</code> |

<a name="ctx.Filter"></a>

### ctx.Filter

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name                 | Default                                |
| -------------------- | -------------------------------------- |
| Nearest              | <code>gl.NEAREST</code>                |
| Linear               | <code>gl.LINEAR</code>                 |
| NearestMipmapNearest | <code>gl.NEAREST_MIPMAP_NEAREST</code> |
| NearestMipmapLinear  | <code>gl.NEAREST_MIPMAP_LINEAR</code>  |
| LinearMipmapNearest  | <code>gl.LINEAR_MIPMAP_NEAREST</code>  |
| LinearMipmapLinear   | <code>gl.LINEAR_MIPMAP_LINEAR</code>   |

<a name="ctx.TextureFormat"></a>

### ctx.TextureFormat

Mapping of format and type (with alternative types).

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name               | Default                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------- |
| RGB                | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                          |
| RGBA               | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                         |
| LUMINANCE_ALPHA    | <code>[&quot;gl.LUMINANCE_ALPHA&quot;,&quot;ctx.DataType.Uint8&quot;]</code>              |
| LUMINANCE          | <code>[&quot;gl.LUMINANCE&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                    |
| ALPHA              | <code>[&quot;gl.ALPHA&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                        |
| R8                 | <code>[&quot;gl.RED&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                          |
| R8_SNORM           | <code>[&quot;gl.RED&quot;,&quot;ctx.DataType.Int8&quot;]</code>                           |
| R16F               | <code>[&quot;gl.RED&quot;,&quot;ctx.DataType.Float16&quot;]</code>                        |
| R32F               | <code>[&quot;gl.RED&quot;,&quot;ctx.DataType.Float32&quot;]</code>                        |
| R8UI               | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                  |
| R8I                | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Int8&quot;]</code>                   |
| R16UI              | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Uint16&quot;]</code>                 |
| R16I               | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Int16&quot;]</code>                  |
| R32UI              | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Uint32&quot;]</code>                 |
| R32I               | <code>[&quot;gl.RED_INTEGER&quot;,&quot;ctx.DataType.Int32&quot;]</code>                  |
| RG8                | <code>[&quot;gl.RG&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                           |
| RG8_SNORM          | <code>[&quot;gl.RG&quot;,&quot;ctx.DataType.Int8&quot;]</code>                            |
| RG16F              | <code>[&quot;gl.RG&quot;,&quot;ctx.DataType.Float16&quot;]</code>                         |
| RG32F              | <code>[&quot;gl.RG&quot;,&quot;ctx.DataType.Float32&quot;]</code>                         |
| RG8UI              | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                   |
| RG8I               | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Int8&quot;]</code>                    |
| RG16UI             | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Uint16&quot;]</code>                  |
| RG16I              | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Int16&quot;]</code>                   |
| RG32UI             | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Uint32&quot;]</code>                  |
| RG32I              | <code>[&quot;gl.RG_INTEGER&quot;,&quot;ctx.DataType.Int32&quot;]</code>                   |
| RGB8               | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                          |
| SRGB8              | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                          |
| RGB565             | <code>[&quot;gl.RGB&quot;,&quot;gl.UNSIGNED_SHORT_5_6_5&quot;]</code>                     |
| RGB8_SNORM         | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Int8&quot;]</code>                           |
| R11F_G11F_B10F     | <code>[&quot;gl.RGB&quot;,&quot;gl.UNSIGNED_INT_10F_11F_11F_REV&quot;]</code>             |
| RGB9_E5            | <code>[&quot;gl.RGB&quot;,&quot;gl.UNSIGNED_INT_5_9_9_9_REV&quot;]</code>                 |
| RGB16F             | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Float16&quot;]</code>                        |
| RGB32F             | <code>[&quot;gl.RGB&quot;,&quot;ctx.DataType.Float32&quot;]</code>                        |
| RGB8UI             | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                  |
| RGB8I              | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Int8&quot;]</code>                   |
| RGB16UI            | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Uint16&quot;]</code>                 |
| RGB16I             | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Int16&quot;]</code>                  |
| RGB32UI            | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Uint32&quot;]</code>                 |
| RGB32I             | <code>[&quot;gl.RGB_INTEGER&quot;,&quot;ctx.DataType.Int32&quot;]</code>                  |
| RGBA8              | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                         |
| SRGB8_ALPHA8       | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                         |
| RGBA8_SNORM        | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Int8&quot;]</code>                          |
| RGB5_A1            | <code>[&quot;gl.RGBA&quot;,&quot;gl.UNSIGNED_SHORT_5_5_5_1&quot;]</code>                  |
| RGBA4              | <code>[&quot;gl.RGBA&quot;,&quot;gl.UNSIGNED_SHORT_4_4_4_4&quot;]</code>                  |
| RGB10_A2           | <code>[&quot;gl.RGBA&quot;,&quot;gl.UNSIGNED_INT_2_10_10_10_REV&quot;]</code>             |
| RGBA16F            | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Float16&quot;]</code>                       |
| RGBA32F            | <code>[&quot;gl.RGBA&quot;,&quot;ctx.DataType.Float32&quot;]</code>                       |
| RGBA8UI            | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Uint8&quot;]</code>                 |
| RGBA8I             | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Int8&quot;]</code>                  |
| RGB10_A2UI         | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;gl.UNSIGNED_INT_2_10_10_10_REV&quot;]</code>     |
| RGBA16UI           | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Uint16&quot;]</code>                |
| RGBA16I            | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Int16&quot;]</code>                 |
| RGBA32I            | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Int32&quot;]</code>                 |
| RGBA32UI           | <code>[&quot;gl.RGBA_INTEGER&quot;,&quot;ctx.DataType.Uint32&quot;]</code>                |
| DEPTH_COMPONENT16  | <code>[&quot;gl.DEPTH_COMPONENT&quot;,&quot;ctx.DataType.Uint16&quot;]</code>             |
| DEPTH_COMPONENT24  | <code>[&quot;gl.DEPTH_COMPONENT&quot;,&quot;ctx.DataType.Uint32&quot;]</code>             |
| DEPTH_COMPONENT32F | <code>[&quot;gl.DEPTH_COMPONENT&quot;,&quot;ctx.DataType.Float32&quot;]</code>            |
| DEPTH24_STENCIL8   | <code>[&quot;gl.DEPTH_STENCIL&quot;,&quot;gl.UNSIGNED_INT_24_8&quot;]</code>              |
| DEPTH32F_STENCIL8  | <code>[&quot;gl.DEPTH_STENCIL&quot;,&quot;gl.FLOAT_32_UNSIGNED_INT_24_8_REV&quot;]</code> |

<a name="ctx.PixelFormat"></a>

### ctx.PixelFormat

Mapping of [ctx.TextureFormat](#ctx.TextureFormat) keys to their string values and legacy depth formats

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name    | Default                        |
| ------- | ------------------------------ |
| Depth   | <code>DEPTH_COMPONENT16</code> |
| Depth16 | <code>DEPTH_COMPONENT16</code> |
| Depth24 | <code>DEPTH_COMPONENT24</code> |

<a name="ctx.RenderbufferFloatFormat"></a>

### ctx.RenderbufferFloatFormat

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name           | Default       |
| -------------- | ------------- |
| RGBA32F        | <code></code> |
| RGBA16F        | <code></code> |
| R16F           | <code></code> |
| RG16F          | <code></code> |
| R32F           | <code></code> |
| RG32F          | <code></code> |
| R11F_G11F_B10F | <code></code> |

<a name="ctx.Encoding"></a>

### ctx.Encoding

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name   | Default        |
| ------ | -------------- |
| Linear | <code>1</code> |
| Gamma  | <code>2</code> |
| SRGB   | <code>3</code> |
| RGBM   | <code>4</code> |

<a name="ctx.Primitive"></a>

### ctx.Primitive

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name          | Default                        |
| ------------- | ------------------------------ |
| Points        | <code>gl.POINTS</code>         |
| Lines         | <code>gl.LINES</code>          |
| LineStrip     | <code>gl.LINE_STRIP</code>     |
| Triangles     | <code>gl.TRIANGLES</code>      |
| TriangleStrip | <code>gl.TRIANGLE_STRIP</code> |

<a name="ctx.Usage"></a>

### ctx.Usage

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name        | Default                      |
| ----------- | ---------------------------- |
| StaticDraw  | <code>gl.STATIC_DRAW</code>  |
| DynamicDraw | <code>gl.DYNAMIC_DRAW</code> |
| StreamDraw  | <code>gl.STREAM_DRAW</code>  |

<a name="ctx.Wrap"></a>

### ctx.Wrap

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name        | Default                       |
| ----------- | ----------------------------- |
| ClampToEdge | <code>gl.CLAMP_TO_EDGE</code> |
| Repeat      | <code>gl.REPEAT</code>        |

<a name="ctx.QueryTarget"></a>

### ctx.QueryTarget

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name                               | Default                                               |
| ---------------------------------- | ----------------------------------------------------- |
| TimeElapsed                        | <code>gl.TIME_ELAPSED</code>                          |
| AnySamplesPassed                   | <code>gl.ANY_SAMPLES_PASSED</code>                    |
| AnySamplesPassedConservative       | <code>gl.ANY_SAMPLES_PASSED_CONSERVATIVE</code>       |
| TransformFeedbackPrimitivesWritten | <code>gl.TRANSFORM_FEEDBACK_PRIMITIVES_WRITTEN</code> |

<a name="ctx.QueryState"></a>

### ctx.QueryState

**Kind**: static enum of [<code>ctx</code>](#ctx)
**Properties**

| Name    | Default              |
| ------- | -------------------- |
| Ready   | <code>ready</code>   |
| Active  | <code>active</code>  |
| Pending | <code>pending</code> |

<a name="ctx.set"></a>

### ctx.set(options)

Set the context size and pixelRatio
The new size and resolution will not be applied immediately but before drawing the next frame to avoid flickering.
Context's canvas doesn't resize automatically, even if you don't pass width/height on init and the canvas is assigned the dimensions of the window. To handle resizing use the following code:

```js
window.addEventListener("resize", () => {
  ctx.set({ width: window.innerWidth, height: window.innerHeight });
});
```

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param   | Type                                                       |
| ------- | ---------------------------------------------------------- |
| options | [<code>PexContextSetOptions</code>](#PexContextSetOptions) |

<a name="ctx.debug"></a>

### ctx.debug([enabled])

Enable debug mode

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param     | Type                 |
| --------- | -------------------- |
| [enabled] | <code>boolean</code> |

<a name="ctx.frame"></a>

### ctx.frame(cb)

Render Loop

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                  | Description                      |
| ----- | --------------------- | -------------------------------- |
| cb    | <code>function</code> | Request Animation Frame callback |

<a name="ctx.submit"></a>

### ctx.submit(cmd, [optsBatchesOrSubCommand], [subCommand])

Submit a command to the GPU.
Commands are plain js objects with GPU resources needed to complete a draw call.

```js
const cmd = {
  pass: Pass
  pipeline: Pipeline,
  attributes: { name:  VertexBuffer | { buffer: VertexBuffer, offset: number, stride: number } },
  indices: IndexBuffer | { buffer: IndexBuffer, offset: number, count: number },
  // or
  count: number,
  instances: number,
  uniforms: { name: number, name: Array, name: Texture2D },
  viewport: [0, 0, 1920, 1080],
  scissor: [0, 0, 1920, 1080]
}
```

_Note: Either indices or count need to be specified when drawing geometry._
_Note: Scissor region is by default set to null and scissor test disabled._

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param                     | Type                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| cmd                       | [<code>PexCommand</code>](#PexCommand)                                                         |
| [optsBatchesOrSubCommand] | [<code>PexCommand</code>](#PexCommand) \| [<code>Array.&lt;PexCommand&gt;</code>](#PexCommand) |
| [subCommand]              | [<code>PexCommand</code>](#PexCommand)                                                         |

**Example**

- `ctx.submit(cmd, opts)`: submit partially updated command without modifying the original one.

```js
// Draw mesh with custom color
ctx.submit(cmd, {
  uniforms: {
    uColor: [1, 0, 0, 0],
  },
});
```

- `ctx.submit(cmd, [opts1, opts2, opts3...])`: submit a batch of commands differences in opts.

```js
// Draw same mesh twice with different material and position
ctx.submit(cmd, [
  { pipeline: material1, uniforms: { uModelMatrix: position1 },
  { pipeline: material2, uniforms: { uModelMatrix: position2 }
])
```

- `ctx.submit(cmd, cb)`: submit command while preserving state from another command. This approach allows to simulate state stack with automatic cleanup at the end of callback.

```js
// Render to texture
ctx.submit(renderToFboCmd, () => {
  ctx.submit(drawMeshCmd);
});
```

<a name="ctx.pass"></a>

### ctx.pass(opts) ⇒ [<code>PexResource</code>](#PexResource)

Passes are responsible for setting render targets (textures) and their clearing values.
FBOs are created internally and automatically.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                     |
| ----- | ---------------------------------------- |
| opts  | [<code>PassOptions</code>](#PassOptions) |

**Example**

```js
const pass = ctx.pass({
  color: [Texture2D, ...]
  color: [{ texture: Texture2D | TextureCube, target: CubemapFace }, ...]
  depth: Texture2D
  clearColor: Array,
  clearDepth: number,
})
```

<a name="ctx.pipeline"></a>

### ctx.pipeline(opts) ⇒ [<code>PexResource</code>](#PexResource)

Pipelines represent the state of the GPU rendering pipeline (shaders, blending, depth test etc).

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                             |
| ----- | ------------------------------------------------ |
| opts  | [<code>PipelineOptions</code>](#PipelineOptions) |

**Example**

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
  primitive: Primitive,
});
```

<a name="ctx.vertexArray"></a>

### ctx.vertexArray(opts) ⇒ [<code>PexResource</code>](#PexResource)

Create a VAO resource.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                                   |
| ----- | ------------------------------------------------------ |
| opts  | [<code>VertexArrayOptions</code>](#VertexArrayOptions) |

**Example**

```js
const vertexLayout = {
  aPosition: { location: 0, type: "vec3" },
  aNormal: { location: 1, type: "vec3" },
};

const drawCmd = {
  pipeline: ctx.pipeline({
    vertexLayout,
    // ...
  }),
  vertexArray: ctx.vertexArray({
    vertexLayout,
    attributes: {
      aPosition: ctx.vertexBuffer(geom.positions),
      aNormal: { buffer: ctx.vertexBuffer(geom.normals) },
    },
    indices: ctx.indexBuffer(geom.cells),
  }),
  // ...
};
```

<a name="ctx.texture2D"></a>

### ctx.texture2D(opts) ⇒ [<code>PexResource</code>](#PexResource)

Create a 2D Texture resource.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| opts  | <code>HTMLImageElement</code> \| <code>HTMLVideoElement</code> \| <code>HTMLCanvasElement</code> \| [<code>TextureOptions</code>](#TextureOptions) |

**Example**

```js
const tex = ctx.texture2D({
  data: [255, 255, 255, 255, 0, 0, 0, 255],
  width: 2,
  height: 1,
  pixelFormat: ctx.PixelFormat.RGB8,
  encoding: ctx.Encoding.Linear,
  wrap: ctx.Wrap.Repeat,
});
```

<a name="ctx.textureCube"></a>

### ctx.textureCube(opts) ⇒ [<code>PexResource</code>](#PexResource)

Create a 2D Texture cube resource.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                                                            |
| ----- | ------------------------------------------------------------------------------- |
| opts  | <code>HTMLImageElement</code> \| [<code>TextureOptions</code>](#TextureOptions) |

**Example**

```js
const tex = ctx.textureCube({
  data: [posx, negx, posy, negy, posz, negz],
  width: 64,
  height: 64
])
```

<a name="ctx.renderbuffer"></a>

### ctx.renderbuffer(opts) ⇒ [<code>PexResource</code>](#PexResource)

Renderbuffers represent pixel data store for rendering operations.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                                     |
| ----- | -------------------------------------------------------- |
| opts  | [<code>RenderbufferOptions</code>](#RenderbufferOptions) |

**Example**

```js
const tex = ctx.renderbuffer({
  width: 1280,
  height: 720,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT16,
});
```

<a name="ctx.vertexBuffer"></a>

### ctx.vertexBuffer(opts) ⇒ [<code>PexResource</code>](#PexResource)

Create an attribute buffer (ARRAY_BUFFER) resource. Stores vertex data in the GPU memory.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                         |
| ----- | -------------------------------------------- |
| opts  | [<code>BufferOptions</code>](#BufferOptions) |

**Example**

```js
const vertexBuffer = ctx.vertexBuffer({
  data: Array | TypedArray | ArrayBuffer,
});
```

<a name="ctx.indexBuffer"></a>

### ctx.indexBuffer(opts) ⇒ [<code>PexResource</code>](#PexResource)

Create an index buffer (ELEMENT_ARRAY_BUFFER) resource. Stores index data in the GPU memory.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                         |
| ----- | -------------------------------------------- |
| opts  | [<code>BufferOptions</code>](#BufferOptions) |

**Example**

```js
const indexBuffer = ctx.vertexBuffer({
  data: Array | TypedArray | ArrayBuffer,
});
```

<a name="ctx.query"></a>

### ctx.query(opts) ⇒ [<code>PexResource</code>](#PexResource)

Queries can be used for GPU timers.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                                       |
| ----- | ------------------------------------------ |
| opts  | [<code>QueryOptions</code>](#QueryOptions) |

**Example**

```js
const query = ctx.query({
  target: QueryTarget,
});
```

<a name="ctx.beginQuery"></a>

### ctx.beginQuery(query)

Begin the query measurement.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                               | Description                                              |
| ----- | ---------------------------------- | -------------------------------------------------------- |
| query | [<code>PexQuery</code>](#PexQuery) | _Note: There can be only one query running at the time._ |

<a name="ctx.endQuery"></a>

### ctx.endQuery(query)

End the query measurement.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param | Type                               | Description                                                                                                                                         |
| ----- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| query | [<code>PexQuery</code>](#PexQuery) | _Note: The result is not available immediately and will be `null` until the state changes from `ctx.QueryState.Pending` to `ctx.QueryState.Ready`._ |

<a name="ctx.readPixels"></a>

### ctx.readPixels(viewport) ⇒ <code>Uint8Array</code>

Helper to read a block of pixels from a specified rectangle of the current color framebuffer.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param    | Type                |
| -------- | ------------------- |
| viewport | <code>Object</code> |

<a name="ctx.update"></a>

### ctx.update(resource, opts)

Update a resource.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param    | Type                                     |
| -------- | ---------------------------------------- |
| resource | [<code>PexResource</code>](#PexResource) |
| opts     | <code>Object</code>                      |

**Example**

```js
ctx.update(buffer, { data: [] });

ctx.update(texture, {
  width: 1,
  height: 1,
  data: new Uint8Array([255, 0, 0, 255]),
});
```

<a name="ctx.dispose"></a>

### ctx.dispose([resource])

Delete one or all resource(s). Disposed resources are no longer valid for use.

**Kind**: static method of [<code>ctx</code>](#ctx)

| Param      | Type                                     |
| ---------- | ---------------------------------------- |
| [resource] | [<code>PexResource</code>](#PexResource) |

**Example**
Delete all allocated resources:

```js
ctx.dispose();
```

Delete a single resource:

```js
ctx.dispose(texture);
```

_Note: Framebuffers are ref counted and released by Pass. Programs are also ref counted and released by Pipeline._
<a name="createContext"></a>

## createContext([options]) ⇒ [<code>ctx</code>](#ctx)

Create a context object

**Kind**: global function

| Param     | Type                                                                                       |
| --------- | ------------------------------------------------------------------------------------------ |
| [options] | [<code>PexContextOptions</code>](#PexContextOptions) \| <code>module:pex-gl~Options</code> |

<a name="BufferOptions"></a>

## BufferOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name       | Type                                                                      | Default                           |
| ---------- | ------------------------------------------------------------------------- | --------------------------------- |
| data       | <code>Array</code> \| <code>TypedArray</code> \| <code>ArrayBuffer</code> |                                   |
| [type]     | <code>ctx.DataType</code>                                                 |                                   |
| [usage]    | [<code>Usage</code>](#ctx.Usage)                                          | <code>ctx.Usage.StaticDraw</code> |
| offset     | <code>number</code>                                                       |                                   |
| normalized | <code>boolean</code>                                                      |                                   |

<a name="Attachment"></a>

## Attachment : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name    | Type                                           |
| ------- | ---------------------------------------------- |
| texture | [<code>PexResource</code>](#PexResource)       |
| target  | <code>WebGLRenderingContext.FRAMEBUFFER</code> |

<a name="PassOptions"></a>

## PassOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name         | Type                                                                                         | Description   |
| ------------ | -------------------------------------------------------------------------------------------- | ------------- |
| [color]      | <code>Array.&lt;Texture2D&gt;</code> \| [<code>Array.&lt;Attachment&gt;</code>](#Attachment) | render target |
| [depth]      | <code>Texture2D</code>                                                                       | render target |
| [clearColor] | [<code>Color</code>](#Color)                                                                 |               |
| [clearDepth] | <code>number</code>                                                                          |               |

<a name="PipelineOptions"></a>

## PipelineOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name                  | Type                                         | Default                               | Description                       |
| --------------------- | -------------------------------------------- | ------------------------------------- | --------------------------------- |
| [vert]                | <code>string</code>                          | <code>null</code>                     | Vertex shader code                |
| [frag]                | <code>string</code>                          | <code>null</code>                     | Fragment shader code              |
| [depthWrite]          | <code>boolean</code>                         | <code>true</code>                     | Depth write mask                  |
| [depthTest]           | <code>boolean</code>                         | <code>false</code>                    | Depth test on/off                 |
| [depthFunc]           | [<code>DepthFunc</code>](#ctx.DepthFunc)     | <code>ctx.DepthFunc.LessEqual</code>  | Depth test function               |
| [blend]               | <code>boolean</code>                         | <code>false</code>                    | Blending on/off                   |
| [blendSrcRGBFactor]   | [<code>BlendFactor</code>](#ctx.BlendFactor) | <code>ctx.BlendFactor.One</code>      | Blending source color factor      |
| [blendSrcAlphaFactor] | [<code>BlendFactor</code>](#ctx.BlendFactor) | <code>ctx.BlendFactor.One</code>      | Blending source alpha factor      |
| [blendDstRGBFactor]   | [<code>BlendFactor</code>](#ctx.BlendFactor) | <code>ctx.BlendFactor.One</code>      | Blending destination color factor |
| [blendDstAlphaFactor] | [<code>BlendFactor</code>](#ctx.BlendFactor) | <code>ctx.BlendFactor.One</code>      | Blending destination alpha factor |
| [cullFace]            | <code>boolean</code>                         | <code>false</code>                    | Face culling on/off               |
| [cullFaceMode]        | [<code>Face</code>](#ctx.Face)               | <code>ctx.Face.Back</code>            | Face culling mode                 |
| [colorMask]           | <code>Array.&lt;boolean&gt;</code>           | <code>[true, true, true, true]</code> | Color write mask for [r, g, b, a] |
| [primitive]           | [<code>Primitive</code>](#ctx.Primitive)     | <code>ctx.Primitive.Triangles</code>  | Geometry primitive                |

<a name="QueryOptions"></a>

## QueryOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name     | Type                                         | Default                                  | Description |
| -------- | -------------------------------------------- | ---------------------------------------- | ----------- |
| [target] | [<code>QueryTarget</code>](#ctx.QueryTarget) | <code>ctx.QueryTarget.TimeElapsed</code> | query type  |

<a name="PexQuery"></a>

## PexQuery : [<code>QueryOptions</code>](#QueryOptions)

**Kind**: global typedef
**Properties**

| Name     | Type                                       | Default                           | Description               |
| -------- | ------------------------------------------ | --------------------------------- | ------------------------- |
| [state]  | [<code>QueryState</code>](#ctx.QueryState) | <code>ctx.QueryState.Ready</code> |                           |
| [result] | <code>number</code>                        |                                   | result of the measurement |

<a name="RenderbufferOptions"></a>

## RenderbufferOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name          | Type                                         | Default                                        | Description                                                                                                                                                                                      |
| ------------- | -------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| width         | <code>number</code>                          |                                                |                                                                                                                                                                                                  |
| height        | <code>number</code>                          |                                                |                                                                                                                                                                                                  |
| [pixelFormat] | [<code>PixelFormat</code>](#ctx.PixelFormat) | <code>ctx.PixelFormat.DEPTH_COMPONENT16</code> | only `PixelFormat.DEPTH_COMPONENT16` is currently supported for use as render pass depth storage (e.g. `ctx.pass({ depth: renderbuffer })`) for platforms with no `WEBGL_depth_texture` support. |

<a name="TextureOptionsData"></a>

## TextureOptionsData : <code>HTMLImageElement</code> \| <code>HTMLVideoElement</code> \| <code>HTMLCanvasElement</code>

**Kind**: global typedef
**Properties**

| Name   | Type                                          |
| ------ | --------------------------------------------- |
| data   | <code>Array</code> \| <code>TypedArray</code> |
| width  | <code>number</code>                           |
| height | <code>number</code>                           |

<a name="TextureTarget"></a>

## TextureTarget : <code>WebGLRenderingContext.TEXTURE_2D</code> \| <code>WebGLRenderingContext.TEXTURE_CUBE_MAP</code>

**Kind**: global typedef
<a name="TextureOptions"></a>

## TextureOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name               | Type                                                                                                                                                                                                                                                                                                                               | Default                                          | Description                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| [data]             | <code>HTMLImageElement</code> \| <code>HTMLVideoElement</code> \| <code>HTMLCanvasElement</code> \| <code>Array</code> \| <code>TypedArray</code> \| [<code>TextureOptionsData</code>](#TextureOptionsData) \| <code>Array.&lt;HTMLImageElement&gt;</code> \| [<code>Array.&lt;TextureOptionsData&gt;</code>](#TextureOptionsData) |                                                  |                                                                                                                              |
| [width]            | <code>number</code>                                                                                                                                                                                                                                                                                                                |                                                  |                                                                                                                              |
| [height]           | <code>number</code>                                                                                                                                                                                                                                                                                                                |                                                  |                                                                                                                              |
| [pixelFormat]      | [<code>PixelFormat</code>](#ctx.PixelFormat)                                                                                                                                                                                                                                                                                       | <code>ctx.PixelFormat.RGB8</code>                |                                                                                                                              |
| [internalFormat]   | [<code>TextureFormat</code>](#ctx.TextureFormat)                                                                                                                                                                                                                                                                                   | <code>ctx.TextureFormat.RGBA</code>              |                                                                                                                              |
| [type]             | <code>ctx.DataType</code>                                                                                                                                                                                                                                                                                                          | <code>ctx.TextureFormat[opts.pixelFormat]</code> |                                                                                                                              |
| [encoding]         | [<code>Encoding</code>](#ctx.Encoding)                                                                                                                                                                                                                                                                                             | <code>ctx.Encoding.Linear</code>                 |                                                                                                                              |
| [wrapS]            | [<code>Wrap</code>](#ctx.Wrap)                                                                                                                                                                                                                                                                                                     | <code>ctx.Wrap.ClampToEdge</code>                |                                                                                                                              |
| [wrapT]            | [<code>Wrap</code>](#ctx.Wrap)                                                                                                                                                                                                                                                                                                     | <code>ctx.Wrap.ClampToEdge</code>                |                                                                                                                              |
| [wrap]             | [<code>Wrap</code>](#ctx.Wrap)                                                                                                                                                                                                                                                                                                     | <code>ctx.Wrap.ClampToEdge</code>                |                                                                                                                              |
| [min]              | [<code>Filter</code>](#ctx.Filter)                                                                                                                                                                                                                                                                                                 | <code>ctx.Filter.Nearest</code>                  |                                                                                                                              |
| [mag]              | [<code>Filter</code>](#ctx.Filter)                                                                                                                                                                                                                                                                                                 | <code>ctx.Filter.Nearest</code>                  |                                                                                                                              |
| [aniso]            | <code>number</code>                                                                                                                                                                                                                                                                                                                | <code>0</code>                                   | requires [EXT_texture_filter_anisotropic](https://www.khronos.org/registry/webgl/extensions/EXT_texture_filter_anisotropic/) |
| [mipmap]           | <code>boolean</code>                                                                                                                                                                                                                                                                                                               | <code>true</code>                                | requires `min` to be set to `ctx.Filter.LinearMipmapLinear` or similar                                                       |
| [premultiplyAlpha] | <code>boolean</code>                                                                                                                                                                                                                                                                                                               | <code>false</code>                               |                                                                                                                              |
| [flipY]            | <code>boolean</code>                                                                                                                                                                                                                                                                                                               | <code>false</code>                               |                                                                                                                              |
| [compressed]       | <code>boolean</code>                                                                                                                                                                                                                                                                                                               | <code>false</code>                               |                                                                                                                              |
| [target]           | [<code>TextureTarget</code>](#TextureTarget)                                                                                                                                                                                                                                                                                       |                                                  |                                                                                                                              |

<a name="TextureCubeOptions"></a>

## TextureCubeOptions : <code>TextureCube</code>

**Kind**: global typedef
**Properties**

| Name   | Type                                                                          | Description                                        |
| ------ | ----------------------------------------------------------------------------- | -------------------------------------------------- |
| [data] | <code>Array.&lt;HTMLImage&gt;</code> \| <code>Array.&lt;TypedArray&gt;</code> | 6 images, one for each face +X, -X, +Y, -Y, +Z, -Z |

<a name="PexContextOptions"></a>

## PexContextOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name         | Type                                                                      | Default                             |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------- |
| [gl]         | <code>WebGLRenderingContext</code> \| <code>WebGL2RenderingContext</code> | <code>WebGL2RenderingContext</code> |
| [width]      | <code>number</code>                                                       | <code>window.innerWidth</code>      |
| [height]     | <code>number</code>                                                       | <code>window.innerHeight</code>     |
| [pixelRatio] | <code>number</code>                                                       | <code>1</code>                      |
| [type]       | <code>&quot;webgl&quot;</code> \| <code>&quot;webgl2&quot;</code>         | <code>&quot;webgl2&quot;</code>     |
| [debug]      | <code>boolean</code>                                                      | <code>false</code>                  |

<a name="PexResource"></a>

## PexResource : <code>Object</code>

All resources are plain js object and once constructed their properties can be accessed directly.
Please note those props are read only. To set new values or upload new data to GPU see [updating resources](context~update).

**Kind**: global typedef
**Properties**

| Name | Type                |
| ---- | ------------------- |
| name | <code>string</code> |

<a name="PexCommand"></a>

## PexCommand : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name       | Type                                             | Description                                                                                                                                              |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pass       | [<code>PassOptions</code>](#PassOptions)         |                                                                                                                                                          |
| pipeline   | [<code>PipelineOptions</code>](#PipelineOptions) |                                                                                                                                                          |
| attributes | <code>Object</code>                              | vertex attributes, map of `attibuteName: ctx.VertexBuffer` or `attributeName: { buffer: VertexBuffer, offset: number, stride: number, divisor: number }` |
| indices    | <code>Object</code>                              | indices, `ctx.IndexBuffer` or `{ buffer: IndexBuffer, offset: number, stride: number }`                                                                  |
| count      | <code>number</code>                              | number of vertices to draw                                                                                                                               |
| instances  | <code>number</code>                              | number instances to draw                                                                                                                                 |
| uniforms   | <code>Object</code>                              | shader uniforms, map of `name: value`                                                                                                                    |
| viewport   | [<code>Viewport</code>](#Viewport)               | drawing viewport bounds                                                                                                                                  |
| scissor    | [<code>Viewport</code>](#Viewport)               | scissor test bounds                                                                                                                                      |

<a name="PexContextSetOptions"></a>

## PexContextSetOptions : <code>Object</code>

**Kind**: global typedef
**Properties**

| Name         | Type                |
| ------------ | ------------------- |
| [width]      | <code>number</code> |
| [height]     | <code>number</code> |
| [pixelRatio] | <code>number</code> |

<a name="Viewport"></a>

## Viewport : <code>Array.&lt;number&gt;</code>

[x, y, w, h]

**Kind**: global typedef
<a name="Color"></a>

## Color : <code>Array.&lt;number&gt;</code>

[r, g, b, a]

**Kind**: global typedef
<a name="VertexArrayOptions"></a>

## VertexArrayOptions : [<code>PexResource</code>](#PexResource)

**Kind**: global typedef
**Properties**

| Name         | Type                |
| ------------ | ------------------- |
| vertexLayout | <code>Object</code> |
| [attributes] | <code>Object</code> |
| [indices]    | <code>Object</code> |

<!-- api-end -->

## Capabilities <a name="capabilitiesTable"></a>

**Example**

```js
const maxTextureSize = ctx.capabilities.maxTextureSize;
```

| Name                         | Type    |
| ---------------------------- | ------- |
| `isWebGL2`                   | number  |
| `maxColorAttachments`        | number  |
| `maxTextureImageUnits`       | number  |
| `maxVertexTextureImageUnits` | number  |
| `maxVertexAttribs`           | number  |
| `maxTextureSize`             | number  |
| `maxCubeMapTextureSize`      | number  |
| `depthTexture`               | Boolean |
| `shaderTextureLod`           | Boolean |
| `textureFloat`               | Boolean |
| `textureFloatLinear`         | Boolean |
| `textureHalfFloat`           | Boolean |
| `textureHalfFloatLinear`     | Boolean |
| `textureFilterAnisotropic`   | Boolean |
| `disjointTimerQuery`         | Boolean |
| `colorBufferFloat`           | Boolean |
| `colorBufferHalfFloat`       | Boolean |

## License

MIT. See [license file](https://github.com/pex-gl/pex-context/blob/main/LICENSE.md).
