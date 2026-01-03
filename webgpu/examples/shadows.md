# shadows-with-context.html

A WebGPU shadow mapping example using the pex-context API to render a bunny with real-time shadows.

## What It Does

- Renders a Stanford bunny with shadow mapping
- Two-pass rendering: depth pass from light view, then main pass with shadow sampling
- Uses comparison sampler for percentage-closer filtering (PCF)

## Rendering Pipeline

### Pass 1: Shadow Map (Depth Pass)
- Renders scene from light's perspective
- Writes to a `depth32float` texture (1024x1024)
- Simple vertex-only transform, minimal fragment shader

### Pass 2: Main Render
- Renders scene from camera perspective
- Samples shadow map using `sampler_comparison`
- Combines diffuse lighting with shadow factor

## API Usage

```javascript
// Create depth texture for shadow map
const depthMap = ctx.texture2D({
  width: 1024,
  height: 1024,
  pixelFormat: "depth32float",
});

// Color target for depth pass (required but not used)
const colorMap = ctx.texture2D({
  width: 1024,
  height: 1024,
  pixelFormat: "rgba8unorm",
  renderTarget: true,
});

// Comparison sampler for shadow testing
const shadowSampler = ctx.sampler({ compare: "less" });

// Depth pass - renders to offscreen textures
const depthPass = ctx.pass({
  color: [colorMap],
  depth: depthMap,
  clearColor: [0, 0, 0, 1],
  clearDepth: 1,
});

// Depth pipeline - must specify colorFormat for offscreen target
const depthPipeline = ctx.pipeline({
  vert: depthVert,
  frag: depthFrag,
  depthTest: true,
  depthFormat: "depth32float",
  colorFormat: "rgba8unorm", // Match the color target format
  vertexLayout: { aPosition: { location: 0, type: "vec3" } },
});

// Main pipeline with shadow sampling
const shadowPipeline = ctx.pipeline({
  vert: shadowVert,
  frag: shadowFrag,
  depthTest: true,
  cullFace: false, // Show floor from both sides
  vertexLayout: {
    aPosition: { location: 0, type: "vec3" },
    aNormal: { location: 1, type: "vec3" },
  },
});

// Render loop
ctx.frame(() => {
  // Pass 1: Render shadow map
  ctx.submit({ pass: depthPass }, () => {
    ctx.submit({ pipeline: depthPipeline, ... });
  });

  // Pass 2: Main render with shadows
  ctx.submit({ pass: mainPass }, () => {
    ctx.submit({
      pipeline: shadowPipeline,
      uniforms: {
        uData: uniformBuffer,
        uShadowMap: depthMap,
        uShadowSampler: shadowSampler,
      },
      ...
    });
  });
});
```

## WGSL Shadow Sampling

```wgsl
@group(0) @binding(1) var shadowMap: texture_depth_2d;
@group(0) @binding(2) var shadowSampler: sampler_comparison;

// In fragment shader:
let ndc = lightSpacePos.xyz / lightSpacePos.w;
let uv = ndc.xy * 0.5 + 0.5;
let sc = clamp(vec2f(uv.x, 1.0 - uv.y), vec2f(0.0), vec2f(1.0));
let depth = clamp(ndc.z - 0.005, 0.0, 1.0); // Bias to prevent acne
let shadow = textureSampleCompare(shadowMap, shadowSampler, sc, depth);
```

## Dependencies

- `gl-matrix` - Matrix/vector math (via ESM CDN)
- `primitive-geometry` - Floor cube geometry (via ESM CDN)
- `bunny` - Stanford bunny model (via ESM CDN)

## Key Concepts

1. **Render-to-Texture** - Depth pass renders to offscreen textures
2. **Pipeline colorFormat** - Must match target texture format for offscreen rendering
3. **Comparison Sampler** - `sampler_comparison` with `textureSampleCompare()` for hardware shadow testing
4. **Nested Submit** - Multiple draw calls share one render pass (prevents depth clear between draws)
5. **Uniform Buffer Layout** - 352 bytes: 5 mat4 (320) + 2 vec4 (32) with proper WGSL alignment
