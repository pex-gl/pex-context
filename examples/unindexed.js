import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import random from "pex-random";
import createGUI from "pex-gui";

import { cube, sphere } from "primitive-geometry";
import splitVertices from "geom-split-vertices";
import computeNormals from "geom-normals";
import merge from "geom-merge";
import gridCells from "grid-cells";

import { viewportToCanvasPosition } from "./utils.js";
import basicVert from "./shaders/basic.vert.js";
import basicFrag from "./shaders/basic.frag.js";
import basicInstancedPositionVert from "./shaders/basic-instanced-position.vert.js";

const pixelRatio = devicePixelRatio;
const ctx = (window.ctx = createContext({ pixelRatio, debug: true }));

const gui = createGUI(ctx, { theme: { columnWidth: 260 } });

const W = ctx.gl.drawingBufferWidth;
const H = ctx.gl.drawingBufferHeight;

const nW = 2;
const nH = 3;
const cells = gridCells(W, H, nW, nH, 0).map((cell) => [
  cell[0],
  H - cell[1] - cell[3], // flip upside down as we are using viewport coordinates
  cell[2],
  cell[3],
]);

const camera = createCamera({
  aspect: W / nW / (H / nH),
  fov: Math.PI / 3,
  position: [2, 2, 3],
});
createOrbiter({ camera });

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

// Geometries
const size = 0.7;
const cubeGeometry = cube({ sx: size });
const unindexedCube = splitVertices(cubeGeometry.positions, cubeGeometry.cells);
const sphereGeometry = sphere({ radius: size / 2 });
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 1 ? value + size * 1.2 : value
);
const unindexedSphere = splitVertices(
  sphereGeometry.positions,
  sphereGeometry.cells
);

const geometries = [sphereGeometry, cubeGeometry];
const unindexedGeometries = [unindexedCube, unindexedSphere];
const indexedMergedGeometry = merge(geometries);
const unindexedMergedGeometry = merge(unindexedGeometries);

// Buffers
const indices = ctx.indexBuffer(cubeGeometry.cells);
const indexedPositions = ctx.vertexBuffer(cubeGeometry.positions);
const indexedNormals = ctx.vertexBuffer(cubeGeometry.normals);
const unindexedPositions = ctx.vertexBuffer(unindexedCube.positions);
const unindexedNormals = ctx.vertexBuffer(
  computeNormals(unindexedCube.positions, unindexedCube.cells)
);
const indexedMergedPositions = ctx.vertexBuffer(
  indexedMergedGeometry.positions
);
const indexedMergedNormals = ctx.vertexBuffer(indexedMergedGeometry.normals);
const unindexedMergedPositions = ctx.vertexBuffer(
  unindexedMergedGeometry.positions
);
const unindexedMergedNormals = ctx.vertexBuffer(
  computeNormals(
    unindexedMergedGeometry.positions,
    unindexedMergedGeometry.cells
  )
);

random.seed("0");
const instances = 3;
const gridOffset = size * 1.2;
const offsets = ctx.vertexBuffer(
  Array.from({ length: instances }, (_, i) => [
    i * gridOffset - (instances / 2) * gridOffset + gridOffset / 2,
    0,
    0,
  ])
);

const commands = {
  Indexed: {
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals,
    },
    indices,
  },
  Unindexed: {
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals,
    },
    count: unindexedCube.positions.length / 3,
  },
  "Indexed Instanced": {
    attributes: {
      aPosition: indexedPositions,
      aNormal: indexedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    indices,
    instances,
  },
  "Unindexed Instanced": {
    attributes: {
      aPosition: unindexedPositions,
      aNormal: unindexedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    count: unindexedCube.positions.length / 3,
    instances,
  },
  "Indexed Instanced BaseVertex BaseInstance": {
    attributes: {
      aPosition: indexedMergedPositions,
      aNormal: indexedMergedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    indices,
    // Start drawing at the second instance
    instances: instances - 1,
    baseInstance: 1,
    // Start vertex at the cube geometry
    baseVertex: geometries[0].positions.length / 3,
  },
  "Unindexed Instanced BaseInstance": {
    attributes: {
      aPosition: unindexedMergedPositions,
      aNormal: unindexedMergedNormals,
      aOffset: { buffer: offsets, divisor: 1 },
    },
    // count: unindexedMergedPositions.length / 3,
    count: unindexedCube.positions.length / 3,
    // Start drawing at the second instance
    instances: instances - 1,
    baseInstance: 1,
  },
};
const headers = {};

const commandsEntries = Object.entries(commands);

ctx.frame(() => {
  ctx.submit(clearCmd);

  cells.forEach((cell, index) => {
    if (commandsEntries[index]) {
      const [header, options] = commandsEntries[index];
      headers[header] ||= gui.addHeader(header);
      headers[header].setPosition(
        ...viewportToCanvasPosition(cell, H, pixelRatio).map((n) => n + 10)
      );
      ctx.submit(options.instances ? drawInstancedCmd : drawCmd, {
        viewport: cell,
        scissor: cell,
        ...options,
      });
    }
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("screenshot"));
});
