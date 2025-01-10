import { mat4, quat } from "pex-math";
import { annulus } from "primitive-geometry";

import { ctx, gui, camera, bunnyGeometry } from "./bunny.js";

import basicMVPInstancedVert from "./shaders/basic-mvp-instanced.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const geom = annulus({ radius: 0.03, innerRadius: 0.01 });

const offsets = structuredClone(bunnyGeometry.positions);
const instances = offsets.length;

const scalesBuffer = ctx.vertexBuffer(offsets.map(() => [1, 1, 1]));
const scalesBufferNext = ctx.vertexBuffer(offsets.map(() => [1, 1, 1]));
const rotationsBuffer = ctx.vertexBuffer(
  bunnyGeometry.normals.map((normal) =>
    quat.fromDirection(quat.create(), normal),
  ),
);

// Commands
const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawVertexLayout = {
  aPosition: { location: 0, type: "vec3" },
  aNormal: { location: 1, type: "vec3" },
  aOffset: { location: 2, type: "vec3" },
  aScale: { location: 3, type: "vec3" },
  aRotation: { location: 4, type: "vec4" },
};

const uniforms = {
  uProjectionMatrix: camera.projectionMatrix,
  uViewMatrix: camera.viewMatrix,
  uModelMatrix: mat4.create(),
};

const drawCmd = {
  pipeline: ctx.pipeline({
    vertexLayout: drawVertexLayout,
    cullFace: true,
    vert: basicMVPInstancedVert,
    frag: basicFrag,
  }),
  uniforms,
  instances,
};

const drawVertexArrayCurrent = ctx.vertexArray({
  vertexLayout: drawVertexLayout,
  attributes: {
    aPosition: { buffer: ctx.vertexBuffer(geom.positions) },
    aNormal: { buffer: ctx.vertexBuffer(geom.normals) },
    aOffset: { buffer: ctx.vertexBuffer(offsets), divisor: 1 },
    aScale: { buffer: scalesBuffer, divisor: 1 },
    aRotation: { buffer: rotationsBuffer, divisor: 1 },
  },
  indices: ctx.indexBuffer(geom.cells),
});

const drawVertexArrayNext = ctx.vertexArray({
  vertexLayout: drawVertexLayout,
  attributes: {
    aPosition: { buffer: ctx.vertexBuffer(geom.positions) },
    aNormal: { buffer: ctx.vertexBuffer(geom.normals) },
    aOffset: { buffer: ctx.vertexBuffer(offsets), divisor: 1 },
    aScale: { buffer: scalesBuffer, divisor: 1 },
    aRotation: { buffer: rotationsBuffer, divisor: 1 },
  },
  indices: ctx.indexBuffer(geom.cells),
});

const updateVertexLayout = {
  aScale: { location: 0, type: "vec3" },
};

const updateCmd = {
  pipeline: ctx.pipeline({
    vertexLayout: updateVertexLayout,
    vert: /* glsl */ `#version 300 es
in vec3 aScale;

uniform int uFrameIndex;

out vec3 outScale;

const int speed = 5;

float quadraticOut(float t) {
  return -t * (t - 2.0);
}

void main() {
  outScale = aScale; // Dummy line for the attribute to be used

  int vertexId = gl_VertexID;
  int vertexCount = ${offsets.length};

  float s = mod(float(vertexId + uFrameIndex * speed), float(vertexCount)) / float(vertexCount);
  s = 0.25 + abs(mix(-0.5, 0.5, quadraticOut(s)));

  outScale = vec3(s);
}
  `,
    frag: /* glsl */ `#version 300 es
void main() {}
  `,
    primitive: ctx.Primitive.POINTS,
  }),
  uniforms,
  count: instances,
};

const updateCmdCurrent = {
  vertexArray: ctx.vertexArray({
    vertexLayout: updateVertexLayout,
    attributes: {
      aScale: { buffer: scalesBuffer },
    },
  }),
  transformFeedback: ctx.transformFeedback({
    varyings: {
      outScale: scalesBufferNext,
    },
  }),
};

const updateCmdNext = {
  vertexArray: ctx.vertexArray({
    vertexLayout: updateVertexLayout,
    attributes: {
      aScale: { buffer: scalesBufferNext },
    },
  }),
  transformFeedback: ctx.transformFeedback({
    varyings: {
      outScale: scalesBuffer,
    },
  }),
};

let frameIndex = 0;

ctx.frame(() => {
  ctx.submit(clearCmd);

  const isCurrent = frameIndex % 2 === 0;

  ctx.submit(
    updateCmd,
    Object.assign(isCurrent ? updateCmdCurrent : updateCmdNext, {
      uniforms: { uFrameIndex: frameIndex },
    }),
  );

  ctx.submit(drawCmd, {
    vertexArray: isCurrent ? drawVertexArrayCurrent : drawVertexArrayNext,
  });

  ctx.debug(false);

  frameIndex++;

  gui.draw();

  window.dispatchEvent(new CustomEvent("screenshot"));
});
