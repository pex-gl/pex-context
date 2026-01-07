/**
 * Radiance Cascades - 2D Global Illumination
 * 
 * Multi-level cascade implementation based on:
 * - https://tmpvar.com/poc/radiance-cascades/
 * - Alexander Sannikov's work on Path of Exile 2
 * 
 * Each cascade level:
 * - Level 0: Finest - small probe spacing, short rays
 * - Level N: Coarser - larger spacing (2^N), longer rays
 * Light propagates from coarse to fine via cascade merging.
 */

const WIDTH = 512;
const HEIGHT = 512;
const CANVAS_WIDTH = 1536; // 3 panels side by side (512 * 3)

// Cascade parameters - tuned for wide light spread
const CASCADE_COUNT = 7;      // More levels = light spreads further (covers 512px)
const BASE_PROBE_SPACING = 4; // Cascade 0 probe spacing
const BASE_RAY_COUNT = 4;     // Rays per probe at cascade 0
const BRANCHING_FACTOR = 2;   // Ray count multiplier per level
const BASE_INTERVAL = 8;      // Ray interval (length) at cascade 0 - larger = faster spread

async function main() {
  const canvas = document.getElementById('canvas');

  if (!navigator.gpu) {
    document.body.innerHTML = '<h1 style="color:red">WebGPU not supported</h1>';
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const ctx = canvas.getContext('webgpu');
  const format = navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({ device, format, alphaMode: 'premultiplied' });

  // World texture - stores emissive scene
  const worldTexture = device.createTexture({
    size: [WIDTH, HEIGHT],
    format: 'rgba16float',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
  });

  // Fluence texture - GI output
  const fluenceTexture = device.createTexture({
    size: [WIDTH, HEIGHT],
    format: 'rgba16float',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
  });

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  // Calculate cascade dimensions
  const cascades = [];
  for (let level = 0; level < CASCADE_COUNT; level++) {
    const spacing = BASE_PROBE_SPACING * Math.pow(2, level);
    const probesX = Math.floor(WIDTH / spacing);
    const probesY = Math.floor(HEIGHT / spacing);
    const rayCount = BASE_RAY_COUNT * Math.pow(BRANCHING_FACTOR, level);
    const intervalStart = level === 0 ? 0 : BASE_INTERVAL * Math.pow(2, level - 1);
    const intervalEnd = BASE_INTERVAL * Math.pow(2, level);
    const totalRays = probesX * probesY * rayCount;

    cascades.push({
      level,
      spacing,
      probesX,
      probesY,
      rayCount,
      intervalStart,
      intervalEnd,
      totalRays,
      // Create probe buffer for this cascade
      buffer: device.createBuffer({
        size: Math.max(totalRays * 16, 16), // vec4f per ray
        usage: GPUBufferUsage.STORAGE,
      }),
      ubo: device.createBuffer({
        size: 48, // Extra space for cascade params
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      }),
    });
  }

  console.log('Cascades:', cascades.map(c => ({
    level: c.level,
    spacing: c.spacing,
    probes: `${c.probesX}x${c.probesY}`,
    rays: c.rayCount,
    interval: `${c.intervalStart}-${c.intervalEnd}`,
    totalRays: c.totalRays,
  })));

  // ========== WORLD PAINT SHADER ==========
  const worldPaintShader = device.createShaderModule({
    code: /* wgsl */`
      struct Params {
        startX: f32, startY: f32,
        endX: f32, endY: f32,
        radius: f32, radiance: f32,
        colorR: f32, colorG: f32, colorB: f32,
        width: f32, height: f32, _pad: f32,
      };
      
      @group(0) @binding(0) var worldTex: texture_storage_2d<rgba16float, write>;
      @group(0) @binding(1) var<uniform> params: Params;

      fn sdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
        let pa = p - a;
        let ba = b - a;
        let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }

      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) id: vec3u) {
        if (id.x >= u32(params.width) || id.y >= u32(params.height)) { return; }
        let pos = vec2f(f32(id.x), f32(id.y));
        let start = vec2f(params.startX, params.startY);
        let end = vec2f(params.endX, params.endY);
        let dist = sdSegment(pos, start, end);
        if (dist <= params.radius) {
          let color = vec3f(params.colorR, params.colorG, params.colorB) * params.radiance;
          textureStore(worldTex, id.xy, vec4f(color, 1.0));
        }
      }
    `
  });

  const worldPaintPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: worldPaintShader, entryPoint: 'main' },
  });

  const worldPaintUBO = device.createBuffer({
    size: 48,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const worldPaintBindGroup = device.createBindGroup({
    layout: worldPaintPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: worldTexture.createView() },
      { binding: 1, resource: { buffer: worldPaintUBO } },
    ],
  });

  // ========== WORLD CLEAR SHADER ==========
  const worldClearShader = device.createShaderModule({
    code: /* wgsl */`
      @group(0) @binding(0) var worldTex: texture_storage_2d<rgba16float, write>;
      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) id: vec3u) {
        textureStore(worldTex, id.xy, vec4f(0.0, 0.0, 0.0, 0.0));
      }
    `
  });

  const worldClearPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: worldClearShader, entryPoint: 'main' },
  });

  const worldClearBindGroup = device.createBindGroup({
    layout: worldClearPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: worldTexture.createView() }],
  });

  // ========== MULTI-LEVEL PROBE RAYMARCH SHADER ==========
  // Each cascade raymarches in its own interval range
  const probeRaymarchShader = device.createShaderModule({
    code: /* wgsl */`
      const PI: f32 = 3.141592653589793;
      const TAU: f32 = PI * 2.0;

      struct Params {
        probesX: i32,
        probesY: i32,
        spacing: f32,
        rayCount: i32,
        intervalStart: f32,
        intervalEnd: f32,
        width: f32,
        height: f32,
        cascadeLevel: i32,
        _pad1: i32,
        _pad2: i32,
        _pad3: i32,
      };

      @group(0) @binding(0) var<storage, read_write> probes: array<vec4f>;
      @group(0) @binding(1) var<uniform> params: Params;
      @group(0) @binding(2) var worldTex: texture_2d<f32>;
      @group(0) @binding(3) var worldSampler: sampler;

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) gid: vec3u) {
        let rayIndex = i32(gid.x);
        let totalRays = params.probesX * params.probesY * params.rayCount;
        if (rayIndex >= totalRays) { return; }

        let probeIndex = rayIndex / params.rayCount;
        let probeRayIndex = rayIndex % params.rayCount;
        
        let probeX = probeIndex % params.probesX;
        let probeY = probeIndex / params.probesX;
        
        // Probe center in world space
        let probeCenter = vec2f(
          f32(probeX) * params.spacing + params.spacing * 0.5,
          f32(probeY) * params.spacing + params.spacing * 0.5
        );

        // Ray direction (evenly distributed around circle)
        let angle = TAU * (f32(probeRayIndex) + 0.5) / f32(params.rayCount);
        let rayDir = vec2f(cos(angle), sin(angle));

        // Raymarch in this cascade's interval range
        var acc = vec4f(0.0, 0.0, 0.0, 1.0);
        let dims = vec2f(params.width, params.height);
        let startDist = params.intervalStart;
        let endDist = params.intervalEnd;
        let stepCount = i32(endDist - startDist);
        
        // Watchdog: max 128 steps
        for (var step = 0; step < stepCount && step < 128; step++) {
          let t = startDist + f32(step);
          let pos = probeCenter + rayDir * t;
          
          if (pos.x < 0.0 || pos.y < 0.0 || pos.x >= dims.x || pos.y >= dims.y) {
            break;
          }
          
          let uv = pos / dims;
          let sample = textureSampleLevel(worldTex, worldSampler, uv, 0.0);
          
          // Front-to-back compositing
          let transparency = 1.0 - sample.a;
          acc = vec4f(
            acc.rgb + acc.a * sample.rgb,
            acc.a * transparency
          );
          
          if (acc.a < 0.01) { break; }
        }

        probes[rayIndex] = acc;
      }
    `
  });

  const probeRaymarchPipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: probeRaymarchShader, entryPoint: 'main' },
  });

  // Create bind groups for each cascade
  for (const cascade of cascades) {
    cascade.bindGroup = device.createBindGroup({
      layout: probeRaymarchPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: cascade.buffer } },
        { binding: 1, resource: { buffer: cascade.ubo } },
        { binding: 2, resource: worldTexture.createView() },
        { binding: 3, resource: sampler },
      ],
    });
  }

  // ========== CASCADE MERGE SHADER ==========
  // Merges higher cascade into lower cascade (coarse to fine)
  const cascadeMergeShader = device.createShaderModule({
    code: /* wgsl */`
      const PI: f32 = 3.141592653589793;
      const TAU: f32 = PI * 2.0;

      struct Params {
        // Lower cascade (finer)
        lowerProbesX: i32,
        lowerProbesY: i32,
        lowerSpacing: f32,
        lowerRayCount: i32,
        // Upper cascade (coarser)
        upperProbesX: i32,
        upperProbesY: i32,
        upperSpacing: f32,
        upperRayCount: i32,
        // Branching factor
        branchingFactor: i32,
        _pad1: i32,
        _pad2: i32,
        _pad3: i32,
      };

      @group(0) @binding(0) var<storage, read_write> lowerProbes: array<vec4f>;
      @group(0) @binding(1) var<storage, read> upperProbes: array<vec4f>;
      @group(0) @binding(2) var<uniform> params: Params;

      fn getUpperProbeRadiance(px: i32, py: i32, rayIdx: i32) -> vec4f {
        let cx = clamp(px, 0, params.upperProbesX - 1);
        let cy = clamp(py, 0, params.upperProbesY - 1);
        let probeIdx = cx + cy * params.upperProbesX;
        let idx = probeIdx * params.upperRayCount + rayIdx;
        return upperProbes[idx];
      }

      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) gid: vec3u) {
        let rayIndex = i32(gid.x);
        let totalRays = params.lowerProbesX * params.lowerProbesY * params.lowerRayCount;
        if (rayIndex >= totalRays) { return; }

        let probeIndex = rayIndex / params.lowerRayCount;
        let lowerRayIdx = rayIndex % params.lowerRayCount;
        
        let probeX = probeIndex % params.lowerProbesX;
        let probeY = probeIndex / params.lowerProbesX;
        
        // Get lower cascade's accumulated radiance so far
        var acc = lowerProbes[rayIndex];
        
        // If ray is not fully opaque, sample from upper cascade
        if (acc.a > 0.01) {
          // Find which rays in upper cascade this ray corresponds to
          // Upper cascade has more rays, so we interpolate between them
          let rayAngle = TAU * (f32(lowerRayIdx) + 0.5) / f32(params.lowerRayCount);
          
          // Map to upper cascade ray index
          let upperRayF = rayAngle / TAU * f32(params.upperRayCount);
          let upperRay0 = i32(floor(upperRayF)) % params.upperRayCount;
          let upperRay1 = (upperRay0 + 1) % params.upperRayCount;
          let blendRay = fract(upperRayF);
          
          // Find corresponding upper cascade probe
          let lowerCenter = vec2f(
            f32(probeX) * params.lowerSpacing + params.lowerSpacing * 0.5,
            f32(probeY) * params.lowerSpacing + params.lowerSpacing * 0.5
          );
          
          // Map to upper cascade probe coordinates
          let upperProbeF = lowerCenter / params.upperSpacing - 0.5;
          let upx0 = i32(floor(upperProbeF.x));
          let upy0 = i32(floor(upperProbeF.y));
          let fx = fract(upperProbeF.x);
          let fy = fract(upperProbeF.y);
          
          // Bilinear sample from upper cascade (sample both ray indices)
          let r00_0 = getUpperProbeRadiance(upx0, upy0, upperRay0);
          let r10_0 = getUpperProbeRadiance(upx0 + 1, upy0, upperRay0);
          let r01_0 = getUpperProbeRadiance(upx0, upy0 + 1, upperRay0);
          let r11_0 = getUpperProbeRadiance(upx0 + 1, upy0 + 1, upperRay0);
          
          let r00_1 = getUpperProbeRadiance(upx0, upy0, upperRay1);
          let r10_1 = getUpperProbeRadiance(upx0 + 1, upy0, upperRay1);
          let r01_1 = getUpperProbeRadiance(upx0, upy0 + 1, upperRay1);
          let r11_1 = getUpperProbeRadiance(upx0 + 1, upy0 + 1, upperRay1);
          
          // Bilinear for each ray
          let upper0 = mix(mix(r00_0, r10_0, fx), mix(r01_0, r11_0, fx), fy);
          let upper1 = mix(mix(r00_1, r10_1, fx), mix(r01_1, r11_1, fx), fy);
          
          // Blend between rays
          let upperRadiance = mix(upper0, upper1, blendRay);
          
          // Merge: add upper cascade's contribution weighted by remaining transparency
          acc = vec4f(
            acc.rgb + acc.a * upperRadiance.rgb,
            acc.a * upperRadiance.a
          );
        }
        
        lowerProbes[rayIndex] = acc;
      }
    `
  });

  const cascadeMergePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: cascadeMergeShader, entryPoint: 'main' },
  });

  // Create merge bind groups for each cascade pair
  const mergeUBOs = [];
  const mergeBindGroups = [];
  for (let i = 0; i < CASCADE_COUNT - 1; i++) {
    const ubo = device.createBuffer({
      size: 48,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    mergeUBOs.push(ubo);

    mergeBindGroups.push(device.createBindGroup({
      layout: cascadeMergePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: cascades[i].buffer } },     // lower (finer)
        { binding: 1, resource: { buffer: cascades[i + 1].buffer } }, // upper (coarser)
        { binding: 2, resource: { buffer: ubo } },
      ],
    }));
  }

  // ========== BUILD FLUENCE FROM CASCADE 0 ==========
  const buildFluenceShader = device.createShaderModule({
    code: /* wgsl */`
      struct Params {
        probesX: i32,
        probesY: i32,
        spacing: f32,
        rayCount: i32,
        width: f32,
        height: f32,
        _pad1: f32,
        _pad2: f32,
      };

      @group(0) @binding(0) var fluenceTex: texture_storage_2d<rgba16float, write>;
      @group(0) @binding(1) var<storage, read> probes: array<vec4f>;
      @group(0) @binding(2) var<uniform> params: Params;

      fn getProbeColor(px: i32, py: i32) -> vec3f {
        let cx = clamp(px, 0, params.probesX - 1);
        let cy = clamp(py, 0, params.probesY - 1);
        let probeIndex = cx + cy * params.probesX;
        let startIdx = probeIndex * params.rayCount;
        
        var acc = vec3f(0.0);
        let rayCountClamped = min(params.rayCount, 64);
        for (var i = 0; i < rayCountClamped; i++) {
          acc += probes[startIdx + i].rgb;
        }
        return acc / f32(rayCountClamped);
      }

      @compute @workgroup_size(16, 16)
      fn main(@builtin(global_invocation_id) id: vec3u) {
        if (f32(id.x) >= params.width || f32(id.y) >= params.height) { return; }
        
        let pixelPos = vec2f(f32(id.x) + 0.5, f32(id.y) + 0.5);
        
        // Bilinear interpolation between probes
        let probePos = pixelPos / params.spacing - 0.5;
        let px0 = i32(floor(probePos.x));
        let py0 = i32(floor(probePos.y));
        let fx = fract(probePos.x);
        let fy = fract(probePos.y);
        
        let c00 = getProbeColor(px0, py0);
        let c10 = getProbeColor(px0 + 1, py0);
        let c01 = getProbeColor(px0, py0 + 1);
        let c11 = getProbeColor(px0 + 1, py0 + 1);
        
        let c0 = mix(c00, c10, fx);
        let c1 = mix(c01, c11, fx);
        let color = mix(c0, c1, fy);
        
        textureStore(fluenceTex, id.xy, vec4f(color, 1.0));
      }
    `
  });

  const buildFluencePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: { module: buildFluenceShader, entryPoint: 'main' },
  });

  const fluenceUBO = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const fluenceBindGroup = device.createBindGroup({
    layout: buildFluencePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: fluenceTexture.createView() },
      { binding: 1, resource: { buffer: cascades[0].buffer } }, // Use cascade 0 (finest)
      { binding: 2, resource: { buffer: fluenceUBO } },
    ],
  });

  // ========== COMPOSITE SHADER (debug view) ==========
  const compositeShader = device.createShaderModule({
    code: /* wgsl */`
      struct VertexOut {
        @builtin(position) pos: vec4f,
        @location(0) uv: vec2f,
      };

      @vertex fn vs(@builtin(vertex_index) i: u32) -> VertexOut {
        var pos = array<vec2f, 3>(vec2f(-1, -1), vec2f(-1, 4), vec2f(4, -1));
        var out: VertexOut;
        out.pos = vec4f(pos[i], 0, 1);
        out.uv = pos[i] * 0.5 + 0.5;
        return out;
      }

      @group(0) @binding(0) var worldTex: texture_2d<f32>;
      @group(0) @binding(1) var fluenceTex: texture_2d<f32>;
      @group(0) @binding(2) var samp: sampler;

      @fragment fn fs(in: VertexOut) -> @location(0) vec4f {
        let uv = vec2f(in.uv.x, 1.0 - in.uv.y);
        
        // 3-panel debug view
        let panel = i32(uv.x * 3.0);
        let localU = fract(uv.x * 3.0);
        let sampleUV = vec2f(localU, uv.y);
        
        let world = textureSample(worldTex, samp, sampleUV);
        let fluence = textureSample(fluenceTex, samp, sampleUV);
        
        var color: vec3f;
        if (panel == 0) {
          color = world.rgb;
        } else if (panel == 1) {
          color = fluence.rgb * 2.0; // Boost for visibility
        } else {
          color = world.rgb + fluence.rgb;
        }
        
        if (abs(localU - 0.0) < 0.005 || abs(localU - 1.0) < 0.005) {
          color = vec3f(0.3);
        }
        
        return vec4f(color, 1.0);
      }
    `
  });

  const compositePipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: compositeShader, entryPoint: 'vs' },
    fragment: {
      module: compositeShader, entryPoint: 'fs',
      targets: [{ format }],
    },
    primitive: { topology: 'triangle-list' },
  });

  const compositeBindGroup = device.createBindGroup({
    layout: compositePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: worldTexture.createView() },
      { binding: 1, resource: fluenceTexture.createView() },
      { binding: 2, resource: sampler },
    ],
  });

  // ========== INPUT HANDLING ==========
  let mouseDown = false;
  let lastPos = [0, 0];
  let currentPos = [0, 0];

  const getCanvasPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (e.clientY - rect.top) * (HEIGHT / rect.height);
    const panelWidth = CANVAS_WIDTH / 3;
    return [
      x * (WIDTH / panelWidth),
      y,
    ];
  };

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    lastPos = getCanvasPos(e);
    currentPos = lastPos;
  });

  canvas.addEventListener('mousemove', (e) => {
    currentPos = getCanvasPos(e);
  });

  canvas.addEventListener('mouseup', () => { mouseDown = false; });
  canvas.addEventListener('mouseleave', () => { mouseDown = false; });

  // Controls
  const radiusSlider = document.getElementById('brushRadius');
  const radianceSlider = document.getElementById('brushRadiance');
  const colorPicker = document.getElementById('brushColor');
  const eraseCheck = document.getElementById('eraseMode');
  const clearBtn = document.getElementById('clearBtn');

  radiusSlider.oninput = () => {
    document.getElementById('radiusVal').textContent = radiusSlider.value;
  };
  radianceSlider.oninput = () => {
    document.getElementById('radianceVal').textContent = (radianceSlider.value / 100).toFixed(1);
  };

  clearBtn.onclick = () => {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(worldClearPipeline);
    pass.setBindGroup(0, worldClearBindGroup);
    pass.dispatchWorkgroups(Math.ceil(WIDTH / 16), Math.ceil(HEIGHT / 16));
    pass.end();
    device.queue.submit([encoder.finish()]);
  };

  // Write cascade params
  for (const cascade of cascades) {
    const buffer = new ArrayBuffer(48);
    const ints = new Int32Array(buffer);
    const floats = new Float32Array(buffer);
    ints[0] = cascade.probesX;
    ints[1] = cascade.probesY;
    floats[2] = cascade.spacing;
    ints[3] = cascade.rayCount;
    floats[4] = cascade.intervalStart;
    floats[5] = cascade.intervalEnd;
    floats[6] = WIDTH;
    floats[7] = HEIGHT;
    ints[8] = cascade.level;
    device.queue.writeBuffer(cascade.ubo, 0, buffer);
  }

  // Write merge params
  for (let i = 0; i < CASCADE_COUNT - 1; i++) {
    const lower = cascades[i];
    const upper = cascades[i + 1];
    const buffer = new ArrayBuffer(48);
    const ints = new Int32Array(buffer);
    const floats = new Float32Array(buffer);
    ints[0] = lower.probesX;
    ints[1] = lower.probesY;
    floats[2] = lower.spacing;
    ints[3] = lower.rayCount;
    ints[4] = upper.probesX;
    ints[5] = upper.probesY;
    floats[6] = upper.spacing;
    ints[7] = upper.rayCount;
    ints[8] = BRANCHING_FACTOR;
    device.queue.writeBuffer(mergeUBOs[i], 0, buffer);
  }

  // Write fluence params (for cascade 0)
  {
    const c = cascades[0];
    const buffer = new ArrayBuffer(32);
    const ints = new Int32Array(buffer);
    const floats = new Float32Array(buffer);
    ints[0] = c.probesX;
    ints[1] = c.probesY;
    floats[2] = c.spacing;
    ints[3] = c.rayCount;
    floats[4] = WIDTH;
    floats[5] = HEIGHT;
    device.queue.writeBuffer(fluenceUBO, 0, buffer);
  }

  // ========== RENDER LOOP ==========
  function render() {
    const encoder = device.createCommandEncoder();

    // Paint if mouse is down
    if (mouseDown) {
      const radius = parseFloat(radiusSlider.value);
      const radiance = eraseCheck.checked ? 0 : parseFloat(radianceSlider.value) / 100;
      const hex = colorPicker.value;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const paintData = new Float32Array([
        lastPos[0], lastPos[1], currentPos[0], currentPos[1],
        radius, radiance, r, g, b, WIDTH, HEIGHT, 0,
      ]);
      device.queue.writeBuffer(worldPaintUBO, 0, paintData);

      const pass = encoder.beginComputePass();
      pass.setPipeline(worldPaintPipeline);
      pass.setBindGroup(0, worldPaintBindGroup);
      pass.dispatchWorkgroups(Math.ceil(WIDTH / 16), Math.ceil(HEIGHT / 16));
      pass.end();

      lastPos = currentPos.slice();
    }

    // Raymarch all cascades (coarse to fine order for proper merging)
    for (let i = CASCADE_COUNT - 1; i >= 0; i--) {
      const cascade = cascades[i];
      const pass = encoder.beginComputePass();
      pass.setPipeline(probeRaymarchPipeline);
      pass.setBindGroup(0, cascade.bindGroup);
      pass.dispatchWorkgroups(Math.ceil(cascade.totalRays / 64));
      pass.end();
    }

    // Merge cascades from coarse to fine
    for (let i = CASCADE_COUNT - 2; i >= 0; i--) {
      const pass = encoder.beginComputePass();
      pass.setPipeline(cascadeMergePipeline);
      pass.setBindGroup(0, mergeBindGroups[i]);
      pass.dispatchWorkgroups(Math.ceil(cascades[i].totalRays / 64));
      pass.end();
    }

    // Build fluence from cascade 0
    {
      const pass = encoder.beginComputePass();
      pass.setPipeline(buildFluencePipeline);
      pass.setBindGroup(0, fluenceBindGroup);
      pass.dispatchWorkgroups(Math.ceil(WIDTH / 16), Math.ceil(HEIGHT / 16));
      pass.end();
    }

    // Composite to screen
    {
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: ctx.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
        }],
      });
      pass.setPipeline(compositePipeline);
      pass.setBindGroup(0, compositeBindGroup);
      pass.draw(3);
      pass.end();
    }

    device.queue.submit([encoder.finish()]);
    requestAnimationFrame(render);
  }

  render();
}

main().catch(console.error);
