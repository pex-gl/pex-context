# webgpu/index.js

Main context factory for WebGPU pex-context API.

## API

```javascript
const ctx = await createContext({
  canvas: HTMLCanvasElement,   // Optional - creates one if not provided
  width: number,               // Canvas width
  height: number,              // Canvas height
  pixelRatio: number,          // Device pixel ratio (default: 1)
  debug: boolean,              // Enable debug logging
});
```

## Properties

| Property | Description |
|----------|-------------|
| `ctx.device` | GPUDevice instance |
| `ctx.context` | GPUCanvasContext |
| `ctx.format` | Preferred canvas format |
| `ctx.canvas` | Canvas element |
| `ctx.width` | Canvas pixel width |
| `ctx.height` | Canvas pixel height |

## Methods

| Method | Description |
|--------|-------------|
| `ctx.pass(opts)` | Create render pass |
| `ctx.pipeline(opts)` | Create render pipeline |
| `ctx.vertexBuffer(data)` | Create vertex buffer |
| `ctx.indexBuffer(data)` | Create index buffer |
| `ctx.uniformBuffer(opts)` | Create uniform buffer |
| `ctx.texture2D(opts)` | Create 2D texture |
| `ctx.sampler(opts)` | Create sampler |
| `ctx.submit(cmd)` | Execute draw command |
| `ctx.frame(cb)` | Render loop |
| `ctx.update(resource, opts)` | Update resource data |
| `ctx.dispose(resource?)` | Dispose resource(s) |

## Differences from pex-context

1. **Async initialization**: `createContext` returns a Promise
2. **No GL fallback**: WebGPU only
3. **`uniformBuffer()`**: New method for explicit uniform buffers
4. **WGSL shaders**: Shaders must be written in WGSL
