/**
 * WebGPU Instanced Lines with Non-Overlapping Geometry
 *
 * Based on https://wwwtyro.net/2021/10/01/instanced-lines-part-2.html
 * Uses interleaved strip technique with terminal segments.
 */

import createContext from "../index.js";
import { mat4 } from "https://esm.sh/pex-math@4";

const W = 640;
const H = 480;
const JOIN_RESOLUTION = 8;

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

// 3D spiral
function generateSpiralPoints(numPoints = 50) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle = t * Math.PI * 4;
    const radius = 0.5 + t * 0.5;
    points.push([Math.cos(angle) * radius, t * 2 - 1, Math.sin(angle) * radius]);
  }
  return points;
}

// ========== SHADERS ==========

// Shared uniforms struct
const uniformsStruct = /*wgsl*/ `
  struct Uniforms {
    projectionMatrix: mat4x4f,
    viewMatrix: mat4x4f,
    resolution: vec2f,
    width: f32,
    _pad: f32,
  };
  @group(0) @binding(0) var<uniform> uniforms: Uniforms;

  fn toScreen(p: vec3f) -> vec2f {
    let clip = uniforms.projectionMatrix * uniforms.viewMatrix * vec4f(p, 1.0);
    return uniforms.resolution * (0.5 * clip.xy / clip.w + 0.5);
  }

  fn toClip(p: vec3f) -> vec4f {
    return uniforms.projectionMatrix * uniforms.viewMatrix * vec4f(p, 1.0);
  }
`;

// Intermediate segments (4 points: pA, pB, pC, pD)
const intermediateSegmentVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @location(0) position: vec2f,
    @location(1) pA: vec3f,
    @location(2) pB: vec3f,
    @location(3) pC: vec3f,
    @location(4) pD: vec3f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    var p0: vec2f; var p1: vec2f; var p2: vec2f;
    var pos = input.position;
    var worldP: vec3f;
    
    if (input.position.x == 0.0) {
      p0 = toScreen(input.pA); p1 = toScreen(input.pB); p2 = toScreen(input.pC);
      worldP = input.pB;
    } else {
      p0 = toScreen(input.pD); p1 = toScreen(input.pC); p2 = toScreen(input.pB);
      pos = vec2f(1.0 - input.position.x, -input.position.y);
      worldP = input.pC;
    }

    let tangent = normalize(normalize(p2 - p1) + normalize(p1 - p0));
    let normal = vec2f(-tangent.y, tangent.x);
    let p01 = p1 - p0;
    let p21 = p1 - p2;
    let p01Norm = normalize(vec2f(-p01.y, p01.x));
    let sigma = sign(dot(p01 + p21, normal));

    var pt: vec2f;
    if (sign(pos.y) == -sigma) {
      pt = p1 + 0.5 * normal * -sigma * uniforms.width / dot(normal, p01Norm);
    } else {
      let xBasis = p2 - p1;
      let yBasis = normalize(vec2f(-xBasis.y, xBasis.x));
      pt = p1 + xBasis * pos.x + yBasis * uniforms.width * pos.y;
    }

    let clip = toClip(worldP);
    output.position = vec4f(clip.w * ((2.0 * pt) / uniforms.resolution - 1.0), clip.z, clip.w);
    output.color = vec4f(0.2, 0.6, 1.0, 1.0); // Blue
    return output;
  }
`;

// Terminal segments (3 points: pA, pB, pC) - first and last segments
const terminalSegmentVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @location(0) position: vec2f,
    @location(1) pA: vec3f,
    @location(2) pB: vec3f,
    @location(3) pC: vec3f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    let sA = toScreen(input.pA);
    let sB = toScreen(input.pB);
    let sC = toScreen(input.pC);

    // For terminal segments: position.x == 0 is the free end, x == 1 needs miter adjustment
    if (input.position.x == 0.0) {
      // Free end - normal expansion
      let xBasis = sB - sA;
      let yBasis = normalize(vec2f(-xBasis.y, xBasis.x));
      let pt = sA + xBasis * input.position.x + yBasis * uniforms.width * input.position.y;
      let clip = toClip(input.pA);
      output.position = vec4f(clip.w * ((2.0 * pt) / uniforms.resolution - 1.0), clip.z, clip.w);
      output.color = vec4f(0.2, 0.6, 1.0, 1.0); // Blue
      return output;
    }

    // Miter end - adjust intersecting corner
    let tangent = normalize(normalize(sC - sB) + normalize(sB - sA));
    let normal = vec2f(-tangent.y, tangent.x);
    let ab = sB - sA;
    let cb = sB - sC;
    let abNorm = normalize(vec2f(-ab.y, ab.x));
    let sigma = sign(dot(ab + cb, normal));

    var pt: vec2f;
    if (sign(input.position.y) == -sigma) {
      pt = sB + 0.5 * normal * -sigma * uniforms.width / dot(normal, abNorm);
    } else {
      let xBasis = sB - sA;
      let yBasis = normalize(vec2f(-xBasis.y, xBasis.x));
      pt = sA + xBasis * input.position.x + yBasis * uniforms.width * input.position.y;
    }

    let clip = toClip(input.pB);
    output.position = vec4f(clip.w * ((2.0 * pt) / uniforms.resolution - 1.0), clip.z, clip.w);
    output.color = vec4f(0.2, 0.6, 1.0, 1.0); // Blue
    return output;
  }
`;

// Round joins
const roundJoinVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @location(0) id: f32,
    @location(1) pointA: vec3f,
    @location(2) pointB: vec3f,
    @location(3) pointC: vec3f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  const PI: f32 = 3.14159265359;
  const RESOLUTION: f32 = ${JOIN_RESOLUTION}.0;

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    let clipB = toClip(input.pointB);
    let screenA = toScreen(input.pointA);
    let screenB = toScreen(input.pointB);
    let screenC = toScreen(input.pointC);
    
    let xBasis = normalize(normalize(screenC - screenB) + normalize(screenB - screenA));
    let yBasis = vec2f(-xBasis.y, xBasis.x);
    
    let ab = screenB - screenA;
    let cb = screenB - screenC;
    let abn = normalize(vec2f(-ab.y, ab.x));
    let cbn = -normalize(vec2f(-cb.y, cb.x));
    let sigma = sign(dot(ab + cb, yBasis));
    
    if (input.id == 0.0) {
      let point = -0.5 * yBasis * sigma * uniforms.width / dot(yBasis, abn);
      let pt = screenB + point;
      output.position = vec4f(clipB.w * ((2.0 * pt) / uniforms.resolution - 1.0), clipB.z, clipB.w);
      output.color = vec4f(0.2, 0.8, 0.4, 1.0); // Green
      return output;
    }
    
    let theta = acos(clamp(dot(abn, cbn), -1.0, 1.0));
    let angle = (sigma * 0.5 * PI) + -0.5 * theta + theta * (input.id - 1.0) / RESOLUTION;
    let pos = 0.5 * uniforms.width * vec2f(cos(angle), sin(angle));
    let pt = screenB + xBasis * pos.x + yBasis * pos.y;
    
    output.position = vec4f(clipB.w * ((2.0 * pt) / uniforms.resolution - 1.0), clipB.z, clipB.w);
    output.color = vec4f(0.2, 0.8, 0.4, 1.0); // Green
    return output;
  }
`;

// Round caps
const roundCapVert = /*wgsl*/ `
  ${uniformsStruct}

  struct VertexInput {
    @location(0) position: vec2f,
    @location(1) pointA: vec3f,
    @location(2) pointB: vec3f,
  };

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
  };

  @vertex fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    
    let clipA = toClip(input.pointA);
    let screenA = toScreen(input.pointA);
    let screenB = toScreen(input.pointB);
    
    let xBasis = normalize(screenA - screenB);
    let yBasis = vec2f(-xBasis.y, xBasis.x);
    
    let pt = screenA + xBasis * uniforms.width * input.position.x + yBasis * uniforms.width * input.position.y;
    
    output.position = vec4f(clipA.w * ((2.0 * pt) / uniforms.resolution - 1.0), clipA.z, clipA.w);
    output.color = vec4f(1.0, 0.4, 0.6, 1.0); // Pink
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
    width: W, height: H, debug: true,
  });

  const linePoints = generateSpiralPoints(30);
  const pointsFlat = linePoints.flat();
  const pointsBuffer = ctx.vertexBuffer(new Float32Array(pointsFlat));

  const numIntermediateSegments = linePoints.length - 3;
  const numJoins = linePoints.length - 2;

  const capGeom = generateRoundCapGeometry(JOIN_RESOLUTION);
  const capPositions = ctx.vertexBuffer(capGeom.positions);
  const capIndices = ctx.indexBuffer(capGeom.indices);

  const joinGeom = generateRoundJoinGeometry(JOIN_RESOLUTION);
  const joinIds = ctx.vertexBuffer(joinGeom.ids.map((id) => [id]).flat());
  const joinIndices = ctx.indexBuffer(joinGeom.indices);

  // Cap data: [start cap point, second point, end cap point, second-to-last point]
  const capPointsData = [
    ...linePoints[0], ...linePoints[1],
    ...linePoints[linePoints.length - 1], ...linePoints[linePoints.length - 2],
  ];
  const capPointsBuffer = ctx.vertexBuffer(new Float32Array(capPointsData));

  // Terminal segment data: first 3 points + last 3 points (reversed)
  const terminalPointsData = [
    ...linePoints[0], ...linePoints[1], ...linePoints[2],
    ...linePoints[linePoints.length - 1], ...linePoints[linePoints.length - 2], ...linePoints[linePoints.length - 3],
  ];
  const terminalPointsBuffer = ctx.vertexBuffer(new Float32Array(terminalPointsData));

  const screenPass = ctx.pass({ clearColor: [0.15, 0.15, 0.15, 1], clearDepth: 1 });
  const uniformBuffer = ctx.uniformBuffer({ size: 4 * 16 * 2 + 4 * 4 });
  const segPositions = ctx.vertexBuffer(segmentGeometry.positions);

  // Intermediate segments pipeline (4 points)
  const drawIntermediateCmd = {
    pipeline: ctx.pipeline({
      vert: intermediateSegmentVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aPosition: { location: 0, type: "vec2", stepMode: "vertex" },
        aPa: { location: 1, type: "vec3", stepMode: "instance", stride: 12 },
        aPb: { location: 2, type: "vec3", stepMode: "instance", stride: 12 },
        aPc: { location: 3, type: "vec3", stepMode: "instance", stride: 12 },
        aPd: { location: 4, type: "vec3", stepMode: "instance", stride: 12 },
      },
    }),
    attributes: {
      aPosition: segPositions,
      aPa: { buffer: pointsBuffer, offset: 0 },
      aPb: { buffer: pointsBuffer, offset: 12 },
      aPc: { buffer: pointsBuffer, offset: 24 },
      aPd: { buffer: pointsBuffer, offset: 36 },
    },
    count: 6, instances: numIntermediateSegments,
    uniforms: { uUniforms: uniformBuffer },
  };

  // Terminal segments pipeline (3 points, 2 instances with stride)
  const drawTerminalCmd = {
    pipeline: ctx.pipeline({
      vert: terminalSegmentVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aPosition: { location: 0, type: "vec2", stepMode: "vertex" },
        aPa: { location: 1, type: "vec3", stepMode: "instance", stride: 36 },
        aPb: { location: 2, type: "vec3", stepMode: "instance", stride: 36 },
        aPc: { location: 3, type: "vec3", stepMode: "instance", stride: 36 },
      },
    }),
    attributes: {
      aPosition: segPositions,
      aPa: { buffer: terminalPointsBuffer, offset: 0 },
      aPb: { buffer: terminalPointsBuffer, offset: 12 },
      aPc: { buffer: terminalPointsBuffer, offset: 24 },
    },
    count: 6, instances: 2,
    uniforms: { uUniforms: uniformBuffer },
  };

  // Round joins pipeline
  const drawJoinsCmd = {
    pipeline: ctx.pipeline({
      vert: roundJoinVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aId: { location: 0, type: "float", stepMode: "vertex" },
        aPointA: { location: 1, type: "vec3", stepMode: "instance", stride: 12 },
        aPointB: { location: 2, type: "vec3", stepMode: "instance", stride: 12 },
        aPointC: { location: 3, type: "vec3", stepMode: "instance", stride: 12 },
      },
    }),
    attributes: {
      aId: joinIds,
      aPointA: { buffer: pointsBuffer, offset: 0 },
      aPointB: { buffer: pointsBuffer, offset: 12 },
      aPointC: { buffer: pointsBuffer, offset: 24 },
    },
    indices: joinIndices, instances: numJoins,
    uniforms: { uUniforms: uniformBuffer },
  };

  // Round caps pipeline
  const drawCapsCmd = {
    pipeline: ctx.pipeline({
      vert: roundCapVert, frag: lineFrag,
      depthTest: true, cullFace: false, blend: true,
      vertexLayout: {
        aPosition: { location: 0, type: "vec2", stepMode: "vertex" },
        aPointA: { location: 1, type: "vec3", stepMode: "instance", stride: 24 },
        aPointB: { location: 2, type: "vec3", stepMode: "instance", stride: 24 },
      },
    }),
    attributes: {
      aPosition: capPositions,
      aPointA: { buffer: capPointsBuffer, offset: 0 },
      aPointB: { buffer: capPointsBuffer, offset: 12 },
    },
    indices: capIndices, instances: 2,
    uniforms: { uUniforms: uniformBuffer },
  };

  const projectionMatrix = mat4.perspective(mat4.create(), Math.PI / 4, W / H, 0.1, 100);
  const viewMatrix = mat4.lookAt(mat4.create(), [3, 2, 3], [0, 0, 0], [0, 1, 0]);

  const uniformData = new Float32Array(32 + 4);
  uniformData.set(projectionMatrix, 0);
  uniformData.set(viewMatrix, 16);
  uniformData.set([W, H], 32);
  uniformData[34] = 8.0;
  ctx.update(uniformBuffer, { data: uniformData });

  let time = 0;
  ctx.frame(() => {
    time += 0.01;
    const angle = time * 0.5;
    mat4.lookAt(viewMatrix, [Math.cos(angle) * 4, 2, Math.sin(angle) * 4], [0, 0, 0], [0, 1, 0]);
    uniformData.set(viewMatrix, 16);
    ctx.update(uniformBuffer, { data: uniformData });

    ctx.submit({ pass: screenPass }, () => {
      ctx.submit(drawIntermediateCmd);
      ctx.submit(drawTerminalCmd);
      ctx.submit(drawJoinsCmd);
      ctx.submit(drawCapsCmd);
    });
    ctx.debug(false);
  });
}

main().catch((err) => {
  console.error(err);
  document.body.innerHTML = `<h1 style="color:red">${err.message}</h1>`;
});
