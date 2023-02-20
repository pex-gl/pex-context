//Based on: https://stackoverflow.com/questions/47934444/webgl-framebuffer-multisampling
import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, sphere } from "primitive-geometry";
import typedArrayConcat from "typed-array-concat";

import basicFrag from "./shaders/basic.frag.js";
import basicVert from "./shaders/basic.vert.js";

const ctx = createContext({
  pixelRatio: devicePixelRatio,
});

const CellsConstructor = Uint32Array;

const cubeGeometry = cube();
cubeGeometry.positions = cubeGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value + 0.75 : value
);
cubeGeometry.cells = new CellsConstructor(cubeGeometry.cells);
const sphereGeometry = sphere();
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value - 0.75 : value
);
cubeGeometry.cells = new CellsConstructor(cubeGeometry.cells);

const geom = {
  positions: typedArrayConcat(
    Float32Array,
    cubeGeometry.positions,
    sphereGeometry.positions
  ),
  normals: typedArrayConcat(
    Float32Array,
    cubeGeometry.normals,
    sphereGeometry.normals
  ),
  uvs: typedArrayConcat(Float32Array, cubeGeometry.uvs, sphereGeometry.uvs),
  cells: typedArrayConcat(
    CellsConstructor,
    cubeGeometry.cells,
    sphereGeometry.cells
  ),
};
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

const count = (cubeGeometry.cells.length + sphereGeometry.cells.length) / 3;
const counts = new Int32Array(count).fill(3);
const offsets = new Int32Array(count).map(
  (_, i) => i * 3 * CellsConstructor.BYTES_PER_ELEMENT
);

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: `${extensionDefine}\n${basicVert}`,
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
