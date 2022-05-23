import createContext from "../index.js";

import { mat4 } from "pex-math";
import createGUI from "pex-gui";

import { cube } from "primitive-geometry";

import basicVert from "./shaders/basic.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const W = 640;
const H = 480;
const ctx = createContext({ width: W, height: H, debug: true });

const gui = createGUI(ctx);
gui.addFPSMeeter();
gui.addStats();

const geom = cube();

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
};

const vertexLayout = {
  aPosition: { location: 0, type: "vec3" },
  aNormal: { location: 1, type: "vec3" },
};

const drawCmd = {
  pipeline: ctx.pipeline({
    vertexLayout,
    depthTest: true,
    vert: basicVert,
    frag: basicFrag,
  }),
  vertexArray: ctx.vertexArray({
    vertexLayout,
    attributes: {
      aPosition: ctx.vertexBuffer(geom.positions),
      aNormal: { buffer: ctx.vertexBuffer(geom.normals) },
    },
    indices: ctx.indexBuffer(geom.cells),
  }),
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

  gui.draw();

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
