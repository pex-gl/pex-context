# webgpu/sampler.js

Texture samplers including comparison samplers for shadow mapping.

## API

```javascript
// Standard sampler
const sampler = ctx.sampler({
  minFilter: 'linear',
  magFilter: 'linear',
  wrap: 'clamp-to-edge',  // or wrapS, wrapT separately
});

// Shadow sampler
const shadowSampler = ctx.sampler({
  compare: 'less',
});
```

## Options

| Option | Values | Default |
|--------|--------|---------|
| `minFilter` | `'linear'`, `'nearest'` | `'linear'` |
| `magFilter` | `'linear'`, `'nearest'` | `'linear'` |
| `wrap` | `'clamp-to-edge'`, `'repeat'`, `'mirror-repeat'` | `'clamp-to-edge'` |
| `wrapS` | Same as wrap | - |
| `wrapT` | Same as wrap | - |
| `compare` | `'less'`, `'greater'`, etc. | - |

## Properties

| Property | Description |
|----------|-------------|
| `sampler.gpuSampler` | GPUSampler instance |

## Shadow Mapping

For shadow mapping, use a comparison sampler with the depth texture:

```javascript
const shadowSampler = ctx.sampler({ compare: 'less' });

// In WGSL shader:
// @group(0) @binding(1) var shadowMap: texture_depth_2d;
// @group(0) @binding(2) var shadowSampler: sampler_comparison;
// textureSampleCompare(shadowMap, shadowSampler, uv, depth)
```
