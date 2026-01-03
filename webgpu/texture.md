# webgpu/texture.js

2D texture creation including depth textures.

## API

```javascript
const texture = ctx.texture2D({
  width: 256,
  height: 256,
  pixelFormat: 'rgba8unorm',  // or ctx.PixelFormat.RGBA8
  data: Uint8Array,           // optional initial data
});
```

## Pixel Formats

| Format | WebGPU Format |
|--------|---------------|
| `RGBA8` | `rgba8unorm` |
| `DEPTH_COMPONENT16` | `depth16unorm` |
| `DEPTH_COMPONENT24` | `depth24plus` |
| `DEPTH_COMPONENT32F` | `depth32float` |

## Properties

| Property | Description |
|----------|-------------|
| `texture.gpuTexture` | GPUTexture instance |
| `texture.gpuTextureView` | GPUTextureView instance |
| `texture.width` | Texture width |
| `texture.height` | Texture height |
| `texture.format` | WebGPU format string |
| `texture.isDepth` | True for depth textures |

## Usage with Shadow Mapping

```javascript
const depthMap = ctx.texture2D({
  width: 1024,
  height: 1024,
  pixelFormat: ctx.PixelFormat.DEPTH_COMPONENT32F,
});
```
