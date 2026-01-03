# Porting `pex-context` Shadows Example to vanilla WebGPU

## Objective
Port `examples/shadows.js` (which mirrors `examples/bunny.js` logic) to a standalone WebGPU implementation in `examples-webgpu/shadows.html`.

## Analysis of `examples/shadows.js` & `bunny.js`
- **Scene**: Rotating bunny + static floor.
- **Lighting**: Single directional/spot light casting shadows.
- **Technique**: Shadow Mapping.
- **Details**: 
    - Render scene from light POV to Depth Texture.
    - Render scene from Camera POV, projecting position to Light Clip Space.
    - Compare depth to determine shadow factor.

## Implementation Plan for `shadows.html`

### 1. Structure
Single HTML file, similar to `basic.html`.

### 2. Dependencies
- `gl-matrix` (esm.sh) for matrices (Model, View, Projection).
- `bunny` (esm.sh) for the mesh.
- `primitive-geometry` (esm.sh) for the floor cube.

### 3. Resources
- **Depth Texture (Shadow Map)**: `depth32float`, size 2048x2048 (or 1024).
- **Sampler**: Comparison sampler for shadow lookup (PCF support built-in to `textureSampleCompare`).
- **Uniforms**:
    - Scene Uniforms: MVP matrices for Camera.
    - Light Uniforms: View/Proj matrices for Light.

### 4. Shaders (WGSL)

**Shadow Pass Shader:**
- Vertex: Transform position by Light MVP.
- Fragment: Empty (depth write only).

**Main Pass Shader:**
- Vertex: 
    - Transform by Camera MVP.
    - Pass World Position and Normal.
    - Calculate Light-Space Position: `lightProj * lightView * worldPos`.
- Fragment:
    - Basic diffuse lighting (dot(N, L)).
    - Shadow calculation: `textureSampleCompare(shadowMap, shadowSampler, lightUV, currentDepth)`.
    - Apply shadow factor to diffuse color.

### 5. Render Loop
1. **Update**: Rotate bunny (simple rotation matrix), update Camera and Light matrices.
2. **Shadow Pass**:
    - PassEncoder `beginRenderPass` (depth attachment = shadow texture).
    - Draw Floor & Bunny.
3. **Main Pass**:
    - PassEncoder `beginRenderPass` (color attachment = canvas, depth = canvas depth).
    - Bind Groups (Uniforms + Shadow Texture/Sampler).
    - Draw Floor & Bunny.

## Differences from Original
- **Mesh Deformation**: I will skip the CPU-side noise deformation of the bunny to keep the example robust and focused on WebGPU rendering features.
- **Depth Comparison**: The original uses linear depth comparison. I will use standard WebGPU NDC depth comparison (`textureSampleCompare`) which is more idiomatic for WebGPU.

## Verification
- Visual check: Shadows should be cast by the bunny onto the floor.
- No console errors.
