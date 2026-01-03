# basic-with-context.html

A simple WebGPU example demonstrating the pex-context API to render a colored cube.

## What It Does

- Renders a unit cube with normals-as-colors shading
- Uses the pex-context WebGPU API for resource management
- Demonstrates basic vertex/index buffers, uniforms, pipeline, and pass setup

## API Usage

```javascript
// Create context
const ctx = await createContext({ canvas, width, height, debug: true });

// Create geometry buffers
const posBuffer = ctx.vertexBuffer(positions);
const normBuffer = ctx.vertexBuffer(normals);
const idxBuffer = ctx.indexBuffer(cells);

// Create uniform buffer for matrices
const uniformBuffer = ctx.uniformBuffer({ size: 4 * 16 * 2 }); // 2 mat4s

// Create pipeline with WGSL shaders
const pipeline = ctx.pipeline({
  vert: vertexShader,
  frag: fragmentShader,
  depthTest: true,
  vertexLayout: {
    aPosition: { location: 0, type: "vec3" },
    aNormal: { location: 1, type: "vec3" },
  },
});

// Create render pass
const screenPass = ctx.pass({ clearColor: [0.2, 0.2, 0.2, 1], clearDepth: 1 });

// Update uniforms
ctx.update(uniformBuffer, { data: uniformData });

// Render loop
ctx.frame(() => {
  ctx.submit({ pass: screenPass }, () => {
    ctx.submit({
      pipeline,
      attributes: { aPosition: posBuffer, aNormal: normBuffer },
      indices: idxBuffer,
      uniforms: { uMatrices: uniformBuffer },
    });
  });
});
```

## Dependencies

- `gl-matrix` - Matrix/vector math (via ESM CDN)
- `primitive-geometry` - Cube geometry generator (via ESM CDN)

## Key Concepts

1. **Context Creation** - `createContext()` initializes WebGPU device and canvas
2. **Buffers** - Vertex, index, and uniform buffers created via `ctx.vertexBuffer()`, `ctx.indexBuffer()`, `ctx.uniformBuffer()`
3. **Pipeline** - Render pipeline with WGSL shaders and vertex layout
4. **Pass** - Render pass configuration (clear color, depth)
5. **Submit** - Nested submit pattern groups draw calls into a single render pass
