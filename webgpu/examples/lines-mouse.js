/**
 * WebGPU Mouse-Following Lines
 * 
 * Line segments follow the mouse cursor like a snake.
 * Gradient coloring from blue to teal to lime green.
 */

import createContext from "../index.js";

const W = 640;
const H = 480;
const NUM_POINTS = 10;
const JOIN_RESOLUTION = 4;

// Segment geometry
const segmentGeometry = {
  positions: [[0, -0.5], [1, -0.5], [1, 0.5], [0, -0.5], [1, 0.5], [0, 0.5]],
};

// Round cap geometry
function generateRoundCapGeometry(resolution) {
  const positions = [[0, 0]];
  for (let i = 0; i <= resolution; i++) {
    const theta = -0.5 * Math.PI + (Math.PI * i) / resolution;
    positions.push([0.5 * Math.cos(theta), 0.5 * Math.sin(theta)]);
  }
  const indices = [];
  for (let i = 0; i < resolution; i++) indices.push(0, i + 1, i + 2);
  return { positions, indices };
}

// Round join geometry
function generateRoundJoinGeometry(resolution) {
  const ids = [];
  const indices = [];
  for (let i = 0; i < resolution + 2; i++) ids.push(i);
  for (let i = 0; i < resolution; i++) indices.push(0, i + 1, i + 2);
  return { ids, indices };
}

// ========== SHADERS ==========

const uniformsStruct = /*wgsl*/ `
  struct Uniforms {
    resolution: vec2f,
    width: f32,
    numSegments: f32,
    debugMode: f32,
    _pad: vec3f,
  };
  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  // Blue -> Teal -> Lime gradient
  fn gradient(t: f32) -> vec3f {
    let blue = vec3f(0.2, 0.4, 1.0);
    let teal = vec3f(0.0, 0.8, 0.8);
    let lime = vec3f(0.6, 1.0, 0.2);
    
    if (t < 0.5) {
      return mix(blue, teal, t * 2.0);
    } else {
      return mix(teal, lime, (t - 0.5) * 2.0);
    }
  }

  // Debug colors for different element types
  const SEGMENT_COLOR: vec3f = vec3f(0.2, 0.6, 1.0);  // Blue
  const JOIN_COLOR: vec3f = vec3f(0.2, 0.9, 0.4);     // Green
  const CAP_COLOR: vec3f = vec3f(1.0, 0.4, 0.6);      // Pink
`;

// Simple 2D segment shader with gradient
const segmentVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @builtin(instance_index) instanceId: u32,
    @location(0) position: vec2f,
    @location(1) pA: vec2f,
    @location(2) pB: vec2f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let xBasis = input.pB - input.pA;
    let yBasis = normalize(vec2f(-xBasis.y, xBasis.x));
    let pt = input.pA + xBasis * input.position.x + yBasis * uniforms.width * input.position.y;
    
    output.position = vec4f((2.0 * pt / uniforms.resolution) - 1.0, 0.0, 1.0);
    output.position.y = -output.position.y;
    
    let t = f32(input.instanceId) / uniforms.numSegments;
    let col = select(gradient(t), SEGMENT_COLOR, uniforms.debugMode > 0.5);
    output.color = vec4f(col, 1.0);
    return output;
  }
`;

// Round join shader with gradient
const roundJoinVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @builtin(instance_index) instanceId: u32,
    @location(0) id: f32,
    @location(1) pointA: vec2f,
    @location(2) pointB: vec2f,
    @location(3) pointC: vec2f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  const PI: f32 = 3.14159265359;
  const RESOLUTION: f32 = ${JOIN_RESOLUTION}.0;

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    let xBasis = normalize(normalize(input.pointC - input.pointB) + normalize(input.pointB - input.pointA));
    let yBasis = vec2f(-xBasis.y, xBasis.x);
    
    let ab = input.pointB - input.pointA;
    let cb = input.pointB - input.pointC;
    let abn = normalize(vec2f(-ab.y, ab.x));
    let cbn = -normalize(vec2f(-cb.y, cb.x));
    let sigma = sign(dot(ab + cb, yBasis));
    
    var pt: vec2f;
    if (input.id == 0.0) {
      let point = -0.5 * yBasis * sigma * uniforms.width / dot(yBasis, abn);
      pt = input.pointB + point;
    } else {
      let theta = acos(clamp(dot(abn, cbn), -1.0, 1.0));
      let angle = (sigma * 0.5 * PI) + -0.5 * theta + theta * (input.id - 1.0) / RESOLUTION;
      let pos = 0.5 * uniforms.width * vec2f(cos(angle), sin(angle));
      pt = input.pointB + xBasis * pos.x + yBasis * pos.y;
    }
    
    output.position = vec4f((2.0 * pt / uniforms.resolution) - 1.0, 0.0, 1.0);
    output.position.y = -output.position.y;
    
    // Join is between segment i and i+1, use midpoint for color
    let t = (f32(input.instanceId) + 0.5) / uniforms.numSegments;
    let col = select(gradient(t), JOIN_COLOR, uniforms.debugMode > 0.5);
    output.color = vec4f(col, 1.0);
    return output;
  }
`;

// Round cap shader with gradient
const roundCapVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @builtin(instance_index) instanceId: u32,
    @location(0) position: vec2f,
    @location(1) pointA: vec2f,
    @location(2) pointB: vec2f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    let xBasis = normalize(input.pointA - input.pointB);
    let yBasis = vec2f(-xBasis.y, xBasis.x);
    
    let pt = input.pointA + xBasis * uniforms.width * input.position.x + yBasis * uniforms.width * input.position.y;
    
    output.position = vec4f((2.0 * pt / uniforms.resolution) - 1.0, 0.0, 1.0);
    output.position.y = -output.position.y;
    
    // Start cap = 0, End cap = 1
    let t = select(1.0, 0.0, input.instanceId == 0u);
    let col = select(gradient(t), CAP_COLOR, uniforms.debugMode > 0.5);
    output.color = vec4f(col, 1.0);
    return output;
  }
`;

const lineFrag = /*wgsl*/ `
  @fragment fn fs_main(@location(0) color: vec4f) -> @location(0) vec4f {
    return color;
  }
`;

async function main() {
  const ctx = await createContext({
    canvas: document.getElementById("canvas"),
    width: W, height: H, debug: false,
  });

  // Initialize points spread from left to right
  const points = [];
  for (let i = 0; i < NUM_POINTS; i++) {
    const t = i / (NUM_POINTS - 1);
    points.push([50 + t * (W - 100), H / 2]); // Spread across width with margin
  }

  let mouseX = W / 2, mouseY = H / 2;
  let lastMouseX = mouseX, lastMouseY = mouseY;
  let mouseMoving = false;

  document.addEventListener("mousemove", (e) => {
    const rect = ctx.canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (W / rect.width);
    mouseY = (e.clientY - rect.top) * (H / rect.height);
    mouseMoving = true;
  });

  const pointsBuffer = ctx.vertexBuffer({ data: new Float32Array(NUM_POINTS * 2) });

  const capGeom = generateRoundCapGeometry(JOIN_RESOLUTION);
  const capPositions = ctx.vertexBuffer(capGeom.positions);
  const capIndices = ctx.indexBuffer(capGeom.indices);
  const capPointsBuffer = ctx.vertexBuffer({ data: new Float32Array(8) });

  const joinGeom = generateRoundJoinGeometry(JOIN_RESOLUTION);
  const joinIds = ctx.vertexBuffer(joinGeom.ids.map((id) => [id]).flat());
  const joinIndices = ctx.indexBuffer(joinGeom.indices);

  const screenPass = ctx.pass({ clearColor: [0.08, 0.08, 0.1, 1] });
  const uniformBuffer = ctx.uniformBuffer({ size: 48 });

  const segPositions = ctx.vertexBuffer(segmentGeometry.positions);
  const numSegments = NUM_POINTS - 1;
  const numJoins = NUM_POINTS - 2;

  // Segment pipeline
  const drawSegmentsCmd = {
    pipeline: ctx.pipeline({
      vert: segmentVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aPosition: { location: 0, type: "vec2", stepMode: "vertex" },
        aPa: { location: 1, type: "vec2", stepMode: "instance", stride: 8 },
        aPb: { location: 2, type: "vec2", stepMode: "instance", stride: 8 },
      },
    }),
    attributes: {
      aPosition: segPositions,
      aPa: { buffer: pointsBuffer, offset: 0 },
      aPb: { buffer: pointsBuffer, offset: 8 },
    },
    count: 6, instances: numSegments,
    uniforms: { uUniforms: uniformBuffer },
  };

  // Joins pipeline
  const drawJoinsCmd = {
    pipeline: ctx.pipeline({
      vert: roundJoinVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aId: { location: 0, type: "float", stepMode: "vertex" },
        aPointA: { location: 1, type: "vec2", stepMode: "instance", stride: 8 },
        aPointB: { location: 2, type: "vec2", stepMode: "instance", stride: 8 },
        aPointC: { location: 3, type: "vec2", stepMode: "instance", stride: 8 },
      },
    }),
    attributes: {
      aId: joinIds,
      aPointA: { buffer: pointsBuffer, offset: 0 },
      aPointB: { buffer: pointsBuffer, offset: 8 },
      aPointC: { buffer: pointsBuffer, offset: 16 },
    },
    indices: joinIndices, instances: numJoins,
    uniforms: { uUniforms: uniformBuffer },
  };

  // Caps pipeline
  const drawCapsCmd = {
    pipeline: ctx.pipeline({
      vert: roundCapVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aPosition: { location: 0, type: "vec2", stepMode: "vertex" },
        aPointA: { location: 1, type: "vec2", stepMode: "instance", stride: 16 },
        aPointB: { location: 2, type: "vec2", stepMode: "instance", stride: 16 },
      },
    }),
    attributes: {
      aPosition: capPositions,
      aPointA: { buffer: capPointsBuffer, offset: 0 },
      aPointB: { buffer: capPointsBuffer, offset: 8 },
    },
    indices: capIndices, instances: 2,
    uniforms: { uUniforms: uniformBuffer },
  };

  const uniformData = new Float32Array(12); // resolution(2) + width(1) + numSegments(1) + debugMode(1) + pad(7)
  uniformData.set([W, H], 0);
  uniformData[2] = 5.0; // line width
  uniformData[3] = numSegments;
  uniformData[4] = 0.0; // debugMode
  ctx.update(uniformBuffer, { data: uniformData });

  // Debug mode checkbox
  const debugCheckbox = document.getElementById("debugMode");
  let debugMode = false;
  debugCheckbox.addEventListener("change", () => {
    debugMode = debugCheckbox.checked;
  });

  // Thickness slider
  const thicknessSlider = document.getElementById("thickness");
  const thicknessValue = document.getElementById("thicknessValue");
  let lineWidth = 5.0;
  thicknessSlider.addEventListener("input", () => {
    lineWidth = parseFloat(thicknessSlider.value);
    thicknessValue.textContent = lineWidth;
  });

  const MIN_SEGMENT_LENGTH = 20; // Minimum distance between points

  ctx.frame(() => {
    uniformData[2] = lineWidth;
    uniformData[4] = debugMode ? 1.0 : 0.0;
    ctx.update(uniformBuffer, { data: uniformData });

    // Check if mouse is still moving
    const mouseDist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
    if (mouseDist < 0.5) mouseMoving = false;
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    // Only update head if mouse is moving
    if (mouseMoving) {
      points[0][0] += (mouseX - points[0][0]) * 0.15; // Slower
      points[0][1] += (mouseY - points[0][1]) * 0.15;
    }

    for (let i = 1; i < NUM_POINTS; i++) {
      const dx = points[i - 1][0] - points[i][0];
      const dy = points[i - 1][1] - points[i][1];
      const dist = Math.hypot(dx, dy);

      // Only move if distance exceeds minimum (prevents shrinking when stopped)
      if (dist > MIN_SEGMENT_LENGTH) {
        const factor = debugMode ? 0.1 : 0.15; // Slower convergence
        points[i][0] += dx * factor;
        points[i][1] += dy * factor;
      }
    }

    ctx.update(pointsBuffer, { data: new Float32Array(points.flat()) });

    const capData = new Float32Array([
      points[0][0], points[0][1], points[1][0], points[1][1],
      points[NUM_POINTS - 1][0], points[NUM_POINTS - 1][1],
      points[NUM_POINTS - 2][0], points[NUM_POINTS - 2][1],
    ]);
    ctx.update(capPointsBuffer, { data: capData });

    ctx.submit({ pass: screenPass }, () => {
      ctx.submit(drawSegmentsCmd);
      ctx.submit(drawJoinsCmd);
      ctx.submit(drawCapsCmd);
    });
  });
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<h1 style="color:red">${err.message}</h1>`;
});
