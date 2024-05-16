import createContext from "../index.js";

import { mat4 } from "pex-math";
import { cube } from "primitive-geometry";

import basicVert from "./shaders/basic.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const W = 640;
const H = 480;
const ctx = createContext({ width: W, height: H, debug: true });

const geom = cube();

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
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: mat4.perspective(
      mat4.create(),
      Math.PI / 4,
      W / H,
      0.1,
      100
    ),
    uViewMatrix: mat4.lookAt(mat4.create(), [2, 2, 5], [0, 0, 0], [0, 1, 0]),
  },
};

ctx.frame(() => {
  ctx.submit(clearCmd);
  ctx.submit(drawCmd);

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("screenshot"));
});
