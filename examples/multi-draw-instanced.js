//Requires: WEBGL_multi_draw
//Requires: WEBGL_multi_draw_instanced_base_vertex_base_instance
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, sphere, torus } from "primitive-geometry";
import typedArrayConcat from "typed-array-concat";

import basicVert from "./shaders/basic-instanced-position.vert.js";
import basicFrag from "./shaders/basic.frag.js";
import merge from "geom-merge";

const ctx = createContext({
  pixelRatio: devicePixelRatio,
});

const CellsConstructor = Uint16Array;

const sphereGeometry = sphere({ radius: 0.2 });
const cubeGeometry = cube({ sx: 0.3 });
const torusGeometry = torus({ radius: 0.2, minorRadius: 0.05 });
const geometries = [sphereGeometry, cubeGeometry, torusGeometry];

let geom = {
  positions: typedArrayConcat(
    Float32Array,
    ...geometries.map((g) => g.positions)
  ),
  normals: typedArrayConcat(Float32Array, ...geometries.map((g) => g.normals)),
  uvs: typedArrayConcat(Float32Array, ...geometries.map((g) => g.uvs)),
  cells: typedArrayConcat(CellsConstructor, ...geometries.map((g) => g.cells)),
};
// geom = merge(geometries);

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

const counts = new Int32Array(geometries.length);
const offsets = new Int32Array(geometries.length);
const baseVertices = new Int32Array(geometries.length);
const baseInstances = new Int32Array(geometries.length);
const instanceCounts = new Int32Array([3, 6, 9]);

const instancePositions = [];

for (let i = 0; i < geometries.length; i++) {
  const numInstancesPerShape = instanceCounts[i];
  for (let j = 0; j < numInstancesPerShape; j++) {
    instancePositions.push([j - 4, i, 0]);
  }

  counts[i] = geometries[i].cells.length;

  if (i > 0) {
    offsets[i] =
      offsets[i - 1] +
      geometries[i - 1].cells.length * CellsConstructor.BYTES_PER_ELEMENT;

    // baseVertices[i] = 0 //when using geom-merge
    baseVertices[i] =
      baseVertices[i - 1] + geometries[i - 1].positions.length / 3;

    baseInstances[i] = baseInstances[i - 1] + instanceCounts[i - 1];
  }
}

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `${extensionDefine}\n${basicVert.replace(
      /*glsl*/ `vColor = vec4(aNormal * 0.5 + 0.5, 1.0);`,
      /*glsl*/ `if (gl_DrawID == 0) {
        vColor = vec4(1, 0, 0, 1);
      } else if (gl_DrawID == 1) {
        vColor = vec4(0, 1, 0, 1);
      } else {
        vColor = vec4(0.0, 0.0, 1.0, 1.0);
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
      buffer: ctx.vertexBuffer(instancePositions),
      divisor: 1,
    },
  },
  indices: ctx.indexBuffer(geom.cells),
  multiDraw: {
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
