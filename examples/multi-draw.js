//Based on: https://stackoverflow.com/questions/47934444/webgl-framebuffer-multisampling
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, sphere, torus } from "primitive-geometry";
import merge from "geom-merge";
import typedArrayConcat from "typed-array-concat";

import basicFrag from "./shaders/basic.frag.js";
import basicVert from "./shaders/basic.vert.js";

const ctx = createContext({
  pixelRatio: devicePixelRatio,
});

const CellsConstructor = Uint32Array;

const sphereGeometry = sphere();
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value - 0.75 : value
);
const cubeGeometry = cube();
// const cubeGeometry = sphere();
cubeGeometry.positions = cubeGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value + 0.75 : value
);
const torusGeometry = torus();
torusGeometry.positions = torusGeometry.positions.map((value, i) =>
  i % 3 === 1 ? value - 0.75 : value
);
let geom;
const geometries = [sphereGeometry, cubeGeometry, torusGeometry];
geom = merge(geometries);

// geom = {
//   positions: typedArrayConcat(
//     Float32Array,
//     ...geometries.map((g) => g.positions)
//   ),
//   normals: typedArrayConcat(Float32Array, ...geometries.map((g) => g.normals)),
//   uvs: typedArrayConcat(Float32Array, ...geometries.map((g) => g.uvs)),
//   cells: typedArrayConcat(
//     CellsConstructor,
//     sphereGeometry.cells,
//     cubeGeometry.cells.map(
//       (i) =>
//         i +
//         sphereGeometry.positions.length / 3 +
//         cubeGeometry.positions.length / 3
//     ),
//     torusGeometry.cells.map(
//       (i) =>
//         i +
//         sphereGeometry.positions.length / 3 +
//         cubeGeometry.positions.length / 3
//     )
//   ),
// };
// geom = torusGeometry;

geom.cells = new CellsConstructor(geom.cells);
console.log(geom);

const camera = createCamera({
  position: [0, 0, 3],
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
        vColor = vec4(float(gl_DrawID)/5.0, 0, 1, 1);
      }
      `
    )}`,
    frag: `${extensionDefine}\n${basicFrag}`,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
    aTexCoord: ctx.vertexBuffer(geom.uvs),
  },
  indices: ctx.indexBuffer(geom.cells),
  multi: {
    counts,
    offsets,
    // offsetsOffset,
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
