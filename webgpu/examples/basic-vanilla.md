# Porting `pex-context` Basic Example to vanilla WebGPU

## Objective
The goal is to create a standalone, vanilla WebGPU implementation of the `pex-context` `examples/basic.js` example. This will reside in `examples-webgpu/basic.html`.

## Analysis of `examples/basic.js`
The original example demonstrates:
- Context creation (`createContext`).
- Resource management (buffers, pipeline).
- Rendering a cube (`primitive-geometry/cube`).
- Basic lighting (normals as color).
- Projection and View matrices (`pex-math/mat4`).
- Rendering loop (`ctx.frame`).

## Implementation Plan for `basic.html`

### 1. Structure
Single HTML file containing all necessary CSS and JavaScript. using ES modules for dependencies.

### 2. Dependencies
To keep it simple and avoid build steps, we will use `esm.sh` to import:
- `gl-matrix` for matrix math (replacing `pex-math` for a more standard standalone approach, or we could use `pex-math` from source if preferred, but `gl-matrix` is very common in WebGPU examples). *Correction: Let's stick to `gl-matrix` as it's a standard choice for vanilla WebGL/WebGPU demos.*
- `primitive-geometry` for the cube mesh (to match the original).

### 3. WebGPU Setup
Standard boilerplate:
- `navigator.gpu.requestAdapter()`
- `adapter.requestDevice()`
- `canvas.getContext('webgpu')`
- `context.configure({...})`

### 4. Shaders (WGSL)
Translate `basic.vert` and `basic.frag` to WGSL.

**Vertex Shader:**
- Inputs: position (vec3), normal (vec3).
- Uniforms: projectionMatrix (mat4x4), viewMatrix (mat4x4).
- Outputs: `builtin(position)` (vec4), `vColor` (vec4).
- Logic:
    - `vColor = vec4(normal * 0.5 + 0.5, 1.0)`
    - `gl_Position` equivalent: `projection * view * vec4(position, 1.0)`

**Fragment Shader:**
- Inputs: `vColor` (vec4).
- Output: `@location(0)` vec4.
- Logic: return `vColor`.

### 5. Geometry
- Fetch cube data from `primitive-geometry`.
- Create Vertex Buffer (interleaved or separate? Separate is easier to match `pex-context`'s `aPosition`, `aNormal` approach, but WebGPU pipelines often prefer interleaved for performance. For simplicity and clarity, we'll keep them consistent with the input data: positions and normals).
- Create Index Buffer.

### 6. Uniforms
- Create a Uniform Buffer for matrices.
- Update loop to update the Uniform Buffer.

### 7. Render Loop
- `requestAnimationFrame `.
- `commandEncoder`.
- `beginRenderPass`.
- `setPipeline`.
- `setVertexBuffer` (slots 0 and 1).
- `setIndexBuffer`.
- `setBindGroup` (for uniforms).
- `drawIndexed`.
- `submit`.

## Thinking Process & Decisions
- **Dependencies:** Using `esm.sh` avoids `npm install` and build tools for this specific example folder, making it truly "vanilla" and easy to run anywhere.
- **Math Library:** `gl-matrix` is the de-facto standard for vanilla WebGL/WebGPU. `pex-math` is great but pulling it into a vanilla example might imply dependencies on the pex ecosystem which we are trying to step outside of for this "port".
- **WGSL:** The shader logic is trivial, so the translation is direct. Key difference is coordinate systems (WebGPU is Z-forward [0, 1] depth, but simple projection matrices handle this).
- **Separation:** Keeping it in `examples-webgpu` cleanly separates it from the main `pex-context` codebase while allowing easy comparison.

## Next Steps
1. Create `examples-webgpu/basic.html` with the implemented code.
2. Open in browser to verify.
