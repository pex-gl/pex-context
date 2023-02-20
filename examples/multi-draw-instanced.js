//Requires: WEBGL_multi_draw
//Requires: WEBGL_multi_draw_instanced_base_vertex_base_instance
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, sphere, torus } from "primitive-geometry";
import merge from "geom-merge";
import typedArrayConcat from "typed-array-concat";

import basicVert from "./shaders/basic-instanced-position.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const ctx = createContext({
  pixelRatio: devicePixelRatio,
});

const CellsConstructor = Uint32Array;

const sphereGeometry = sphere({ radius: 0.1 });
const cubeGeometry = cube({ sx: 0.1, sy: 0.25, sz: 0.1 });
const torusGeometry = torus({ radius: 0.1, minorRadius: 0.03 });
let geom;
const geometries = [sphereGeometry, cubeGeometry, torusGeometry];
geom = merge(geometries);

geom.cells = new CellsConstructor(geom.cells);
console.log(geom);

const camera = createCamera({
  position: [0, 0, 7],
});
createOrbiter({ camera });

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const extensionDefine = `#extension GL_ANGLE_multi_draw: require`;

const counts = new Int32Array([
  sphereGeometry.cells.length,
  cubeGeometry.cells.length,
  torusGeometry.cells.length,
]);

const offsets = new Int32Array([
  0,
  sphereGeometry.cells.length * CellsConstructor.BYTES_PER_ELEMENT,
  (sphereGeometry.cells.length + cubeGeometry.cells.length) *
    CellsConstructor.BYTES_PER_ELEMENT,
]);

function randomFloat(r = 1) {
  return (Math.random() * 2 - 1) * r;
}
const instancedOffsets = [];
const baseVertices = [];
const baseInstances = [];
const numShapes = 3;
const N = 3;
const instanceCounts = new Int32Array([N, N * 2, N * 3]);

let base = 0;
let vertexCountPerShape = [
  sphereGeometry.cells.length / 3,
  torusGeometry.cells.length / 3,
  cubeGeometry.cells.length / 3,
];

let totalVertexCount = 0;
for (let i = 0; i < numShapes; i++) {
  const numInstancesPerShape = instanceCounts[i];
  for (let j = 0; j < numInstancesPerShape; j++) {
    const offset = [j - 4, i, 0];
    instancedOffsets.push(offset);
  }
  totalVertexCount += numInstancesPerShape * vertexCountPerShape[i];
  baseVertices.push(0);
  baseInstances.push(base);
  base += numInstancesPerShape;
}

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `${extensionDefine}\n${basicVert.replace(
      "vColor = vec4(aNormal * 0.5 + 0.5, 1.0);",
      `if (gl_DrawID == 0) {
        vColor = vec4(1, 0, 0, 1);
      } else if (gl_DrawID == 1) {
        vColor = vec4(0, 1, 0, 1);
      } else {
        vColor = vec4(float(gl_DrawID)/5.0, 0.0, 1.0, 1.0);
      }
      `
    )}`,
    frag: `${extensionDefine}\n${basicFrag}`,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
    aTexCoord: ctx.vertexBuffer(geom.uvs),
    aOffset: {
      buffer: ctx.vertexBuffer(new Float32Array(instancedOffsets.flat())),
      divisor: 1,
    },
  },
  indices: ctx.indexBuffer(geom.cells),
  multi: {
    counts,
    offsets,
    instanceCounts,
    baseVertices: baseVertices,
    baseInstances: baseInstances,
  },
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  ctx.set({ width: W, height: H });
  camera.set({ aspect: W / H });
};
window.addEventListener("resize", onResize);
onResize();

ctx.frame(() => {
  ctx.submit(clearCmd);

  ctx.submit(drawCmd, {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix,
    },
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
