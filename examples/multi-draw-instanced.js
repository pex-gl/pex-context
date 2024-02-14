import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";
import createGUI from "pex-gui";

import { cube, sphere, torus } from "primitive-geometry";
import typedArrayConcat from "typed-array-concat";
import merge from "geom-merge";
import splitVertices from "geom-split-vertices";
import computeNormals from "geom-normals";
import gridCells from "grid-cells";

import { viewportToCanvasPosition } from "./utils.js";
import basicFrag from "./shaders/basic.frag.js";
import basicMultiDrawVert from "./shaders/basic-multi-draw.vert.js";

const pixelRatio = devicePixelRatio;
const ctx = (window.ctx = createContext({ pixelRatio, debug: false }));

const gui = createGUI(ctx, { theme: { columnWidth: 340 } });

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
  position: [3, 1, 3],
  target: [3, 0, 0],
});
createOrbiter({ camera });

// Create geometries
const size = 0.3;
const sphereGeometry = sphere({ radius: size / 2 });
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value - size * 1.2 : value,
);
const unindexedSphere = splitVertices(
  sphereGeometry.positions,
  sphereGeometry.cells,
);
const cubeGeometry = cube({ sx: size });
const unindexedCube = splitVertices(cubeGeometry.positions, cubeGeometry.cells);
const torusGeometry = torus({
  radius: size * 0.5,
  minorRadius: size * 0.5 * 0.4,
});
torusGeometry.positions = torusGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value + size * 1.2 : value,
);
const unindexedTorus = splitVertices(
  torusGeometry.positions,
  torusGeometry.cells,
);

const geometries = [sphereGeometry, cubeGeometry, torusGeometry];
const unindexedGeometries = [unindexedSphere, unindexedCube, unindexedTorus];
// if (unindexed) {
//   geometries.forEach((geometry) => {
//     geometry.normals = computeNormals(geometry.positions, geometry.cells);
//   });
// }
const indexedMergedGeometry = merge(geometries);
// const indexedMergedGeometry = {
//   positions: typedArrayConcat(
//     Float32Array,
//     ...geometries.map((g) => g.positions)
//   ),
//   normals: typedArrayConcat(Float32Array, ...geometries.map((g) => g.normals)),
//   // uvs: typedArrayConcat(Float32Array, ...geometries.map((g) => g.uvs)),
//   cells: typedArrayConcat(CellsConstructor, ...geometries.map((g) => g.cells)),
// };
const unindexedMergedGeometry = merge(unindexedGeometries);

// Buffers
const indices = ctx.indexBuffer(indexedMergedGeometry.cells);
const indexedPositions = ctx.vertexBuffer(indexedMergedGeometry.positions);
const unindexedPositions = ctx.vertexBuffer(unindexedMergedGeometry.positions);

// Draw data
const counts = new Int32Array(geometries.length);
const unIndexedCounts = new Int32Array(geometries.length);
const offsets = new Int32Array(geometries.length);
const firsts = new Int32Array(geometries.length);
const baseVertices = new Int32Array(geometries.length);
const baseInstances = new Int32Array(geometries.length);
const instanceCounts = new Int32Array([3, 6, 9]); // 3 spheres, 6 cubes, 9 torii

const instancePositions = []; // 3 + 6 + 9 = 18 positions

for (let i = 0; i < geometries.length; i++) {
  const numInstancesOfEachGeometry = instanceCounts[i];
  for (let j = 0; j < numInstancesOfEachGeometry; j++) {
    instancePositions.push([j, i, 0]);
    // instancePositions.push([j - 3, i - (geometries.length - 1) / 2, 0]);
  }

  counts[i] = geometries[i].cells.length;

  // Unindexed
  unIndexedCounts[i] = unindexedGeometries[i].positions.length / 3;
  if (i > 0) firsts[i] = firsts[i - 1] + counts[i - 1];

  if (i > 0) {
    offsets[i] =
      offsets[i - 1] +
      counts[i - 1] * indexedMergedGeometry.cells.constructor.BYTES_PER_ELEMENT;

    baseVertices[i] = 0; //when using geom-merge
    // baseVertices[i] =
    //   baseVertices[i - 1] + geometries[i - 1].positions.length / 3;

    baseInstances[i] = baseInstances[i - 1] + instanceCounts[i - 1];
  }
}

const instancedOffsets = ctx.vertexBuffer(instancePositions);

// Commands
const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: /* glsl */ `
${ctx.capabilities.multiDraw ? "#define USE_MULTI_DRAW" : ""}
${basicMultiDrawVert}`,
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
    vert: /* glsl */ `
${ctx.capabilities.multiDraw ? "#define USE_MULTI_DRAW" : ""}
#define USE_INSTANCED_OFFSET
${basicMultiDrawVert}`,
    frag: basicFrag,
  }),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const commands = {
  "MultiDraw Indexed": {
    attributes: {
      aPosition: indexedPositions,
    },
    indices,
    multiDraw: {
      counts,
      offsets,
      // Ignore first geometry to test offsets
      countsOffset: 1,
      offsetsOffset: 1,
      drawCount: geometries.length - 1,
    },
  },
  "MultiDraw Unindexed": {
    attributes: {
      aPosition: unindexedPositions,
    },
    multiDraw: {
      firsts,
      counts: unIndexedCounts,
      firstsOffset: 1,
      countsOffset: 1,
      drawCount: unindexedGeometries.length - 1,
    },
  },
  "MultiDraw Indexed Instanced": {
    attributes: {
      aPosition: indexedPositions,
      aOffset: { buffer: instancedOffsets, divisor: 1 },
    },
    indices,
    multiDraw: {
      counts,
      offsets,
      instanceCounts,
      // Ignore first geometry to test offsets
      countsOffset: 1,
      offsetsOffset: 1,
      instanceCountsOffset: 1,
      drawCount: geometries.length - 1,
    },
  },
  "MultiDraw Unindexed Instanced": {
    attributes: {
      aPosition: unindexedPositions,
      aOffset: { buffer: instancedOffsets, divisor: 1 },
    },
    multiDraw: {
      firsts,
      counts,
      instanceCounts,
      // Ignore first geometry to test offsets
      firstsOffset: 1,
      countsOffset: 1,
      instanceCountsOffset: 1,
      drawCount: geometries.length - 1,
    },
  },
  "MultiDraw Indexed Instanced BaseVertices BaseInstances": {
    attributes: {
      aPosition: indexedPositions,
      // aNormal: ctx.vertexBuffer(geometry.normals),
      // aTexCoord: ctx.vertexBuffer(geometry.uvs),
      aOffset: { buffer: instancedOffsets, divisor: 1 },
    },
    indices,
    multiDraw: {
      counts,
      offsets,
      instanceCounts,
      countsOffset: 1,
      offsetsOffset: 1,
      instanceCountsOffset: 1,
      drawCount: geometries.length - 1,
      baseVertices,
      baseInstances,
    },
  },
  "MultiDraw Unindexed Instanced BaseInstances": {
    attributes: {
      aPosition: unindexedPositions,
      aOffset: { buffer: instancedOffsets, divisor: 1 },
    },
    multiDraw: {
      firsts,
      counts,
      instanceCounts,
      firstsOffset: 1,
      countsOffset: 1,
      instanceCountsOffset: 1,
      drawCount: geometries.length - 1,
      baseInstances,
    },
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
        ...viewportToCanvasPosition(cell, H, pixelRatio).map((n) => n + 10),
      );
      ctx.submit(
        options.multiDraw.instanceCounts ? drawInstancedCmd : drawCmd,
        {
          viewport: cell,
          scissor: cell,
          ...options,
        },
      );
    }
  });

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
