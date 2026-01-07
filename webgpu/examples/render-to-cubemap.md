# Render to Cubemap - WebGPU Port

Port of `examples/render-to-cubemap.js` to WebGPU.

## Status: ✅ Complete

## What's Implemented

- **Cubemap texture** (`ctx.textureCube()`) - 6-face texture with both cube view (for sampling) and individual face views (for rendering)
- **Dynamic cubemap rendering** - Renders 6 colored boxes to cubemap from center point
- **Reflective sphere** - Samples cubemap using reflection vector
- **WGSL shaders** - Diffuse lighting and cubemap reflection

## Simplifications from Original

The original WebGL example uses:
- ❌ pex-cam (orbiter camera) → Static camera
- ❌ pex-gui (debug UI) → No UI
- ❌ pex-io (image loading) → Procedural colors
- ❌ External skybox images → Colored boxes only

## Files

| File | Description |
|------|-------------|
| `render-to-cubemap.html` | HTML wrapper |
| `render-to-cubemap.js` | Main example with WGSL shaders |
| `../index.js` | Added `textureCube()` method |
| `../texture.js` | Added `createTextureCube()` function |

## Usage

```bash
npm run dev
# Open http://localhost:5173/webgpu/examples/render-to-cubemap.html
```

## Key Implementation Details

### Cubemap Creation
```javascript
const reflectionMap = ctx.textureCube({
    width: 512,
    height: 512,
    pixelFormat: "rgba8unorm",
});
```

### Rendering to Faces
Each face gets its own pass targeting `reflectionMap.faceViews[i]`.

### Sampling in Shader
```wgsl
@group(0) @binding(1) var envMap: texture_cube<f32>;
let R = reflect(I, N);
return textureSample(envMap, envSampler, R);
```
