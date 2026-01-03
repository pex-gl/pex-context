# webgpu/pipeline.js

Render pipeline creation with WGSL shaders.

## API

```javascript
const pipeline = ctx.pipeline({
  vert: wgslCode,           // WGSL vertex shader
  frag: wgslCode,           // WGSL fragment shader
  vertexLayout: {           // Optional - auto-detected from shader
    aPosition: { location: 0, type: 'vec3' },
    aNormal: { location: 1, type: 'vec3' },
  },
  depthTest: true,          // Enable depth testing
  depthWrite: true,         // Enable depth writing
  depthFormat: 'depth24plus', // Depth format
  cullFace: true,           // Enable backface culling
  cullFaceMode: 'back',     // 'front', 'back', or 'none'
  blend: false,             // Enable alpha blending
  vertexEntryPoint: 'vs_main',   // Vertex shader entry point
  fragmentEntryPoint: 'fs_main', // Fragment shader entry point
});
```

## Properties

| Property | Description |
|----------|-------------|
| `pipeline.gpuPipeline` | GPURenderPipeline instance |
| `pipeline.bindGroupLayout` | GPUBindGroupLayout for uniforms |

## Vertex Layout Types

| Type | WebGPU Format | Stride |
|------|---------------|--------|
| `float` | `float32` | 4 bytes |
| `vec2` | `float32x2` | 8 bytes |
| `vec3` | `float32x3` | 12 bytes |
| `vec4` | `float32x4` | 16 bytes |
