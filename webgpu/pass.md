# webgpu/pass.js

Render passes for framebuffers and clear operations.

## API

```javascript
// Screen pass (clears and renders to canvas)
const screenPass = ctx.pass({
  clearColor: [0.2, 0.2, 0.2, 1],
  clearDepth: 1,
});

// Render-to-texture pass
const rttPass = ctx.pass({
  color: [colorTexture],
  depth: depthTexture,
  clearColor: [0, 0, 0, 1],
  clearDepth: 1,
});

// Multiple render targets
const mrtPass = ctx.pass({
  color: [colorTex1, colorTex2],
  depth: depthTexture,
  clearColor: [[1, 0, 0, 1], [0, 1, 0, 1]],
  clearDepth: 1,
});
```

## Properties

| Property | Description |
|----------|-------------|
| `pass.clearColor` | Clear color(s) |
| `pass.clearDepth` | Clear depth value |
| `pass.colorTargets` | Array of color textures |
| `pass.depthTarget` | Depth texture |
| `pass.isScreenPass` | True for canvas rendering |

## Screen Pass Depth

Screen passes automatically create a depth texture matching the canvas size. This texture is recreated on resize.
