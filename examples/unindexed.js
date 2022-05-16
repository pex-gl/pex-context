import createContext from "../index.js";

import { perspective as createCamera } from "pex-cam";
import random from "pex-random";
import createGUI from "pex-gui";

import { cube } from "primitive-geometry";

import { computeNormals, splitVertices } from "./utils.js";

import basicVert from "./shaders/basic.vert.js";
import basicFrag from "./shaders/basic.frag.js";
import basicInstancedPositionVert from "./shaders/basic-instanced-position.vert.js";

const ctx = createContext({ debug: true });

const W = window.innerWidth;
const H = window.innerHeight;
const halfW = Math.floor(W / 2);
const halfH = Math.floor(H / 2);

const gui = createGUI(ctx);
gui.addHeader("Indexed").setPosition(10, 10);
gui.addHeader("Unndexed").setPosition(W / 2 + 10, 10);
gui.addHeader("Indexed instanced").setPosition(10, H / 2 + 10);
gui.addHeader("Unindexed instanced").setPosition(W / 2 + 10, H / 2 + 10);

const camera = createCamera({
  aspect: W / H,
  fov: Math.PI / 3,
  position: [2, 1, 2],
});

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicVert,
    frag: basicFrag,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const drawInstancedCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: basicInstancedPositionVert,
    frag: basicFrag,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const geom = cube();
const indexedPositions = ctx.vertexBuffer(geom.positions);
const indexedNormals = ctx.vertexBuffer(geom.normals);
const indices = ctx.indexBuffer(geom.cells);

const unindexedCube = splitVertices(geom.positions, geom.cells);
const unindexedPositions = ctx.vertexBuffer(unindexedCube.positions);
const unindexedNormals = ctx.vertexBuffer(
  computeNormals(unindexedCube.positions, unindexedCube.cells)
);

random.seed(1);
const instances = 20;
const offsets = ctx.vertexBuffer(
  Array.from({ length: instances }, () => random.vec3(0.5))
);

ctx.frame(() => {
  ctx.submit(clearCmd);

  // indexed
  ctx.submit(drawCmd, {
    viewport: [0, halfH, halfW, halfH],
    scissor: [0, halfH, halfW, halfH],
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals,
    },
    indices,
  });

  // unindexed
  ctx.submit(drawCmd, {
    viewport: [halfW, halfH, halfW, halfH],
    scissor: [halfW, halfH, halfW, halfH],
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals,
    },
    count: unindexedCube.positions.length / 3,
  });

  // indexed instanced
  ctx.submit(drawInstancedCmd, {
    viewport: [0, 0, halfW, halfH],
    scissor: [0, 0, halfW, halfH],
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    indices,
    instances: instances,
  });

  // unindexed instanced
  ctx.submit(drawInstancedCmd, {
    viewport: [halfW, 0, halfW, halfH],
    scissor: [halfW, 0, halfW, halfH],
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    count: unindexedCube.positions.length / 3,
    instances: instances,
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
