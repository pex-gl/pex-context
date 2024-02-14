import createContext from "../index.js";

import { vec4, mat3, mat4 } from "pex-math";
import { perspective as createCamera } from "pex-cam";
import random from "pex-random";

import { cube } from "primitive-geometry";

import basicMVP from "./shaders/basic-mvp.vert.js";
import basicFrag from "./shaders/basic.frag.js";

const ctx = createContext({ debug: true });

let viewport;
const vw = 800;
const vh = 400;

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: vw / vh,
  position: [5, 1, 5],
});

const geom = cube();

random.seed(4);

const cubes = [];
for (let i = 0; i < 8; i++) {
  const position = random.vec3(3);
  const modelMatrix = mat4.create();
  mat4.translate(modelMatrix, position);

  const label = document.createElement("span");
  label.innerText = `Cube ${i}`;
  Object.assign(label.style, {
    position: "absolute",
    left: "50px",
    top: "50px",
    color: "white",
    fontFamily: "sans-serif",
    pointerEvents: "none",
    transform: "translate3d(-50%, -50%, 0)",
  });
  document.body.appendChild(label);

  cubes.push({
    label,
    position,
    modelMatrix,
    normalMatrix: mat3.create(),
  });
}

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.1, 0.1, 0.1, 1],
    clearDepth: 1,
  }),
};

const drawInViewport = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
  }),
  // viewport,
  // scissor: viewport,
};

const drawCubeCmd = {
  pipeline: ctx.pipeline({
    vert: basicMVP,
    frag: basicFrag,
    depthTest: true,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geom.positions),
    aNormal: ctx.vertexBuffer(geom.normals),
  },
  indices: ctx.indexBuffer(geom.cells),
  uniforms: {
    uProjectionMatrix: camera.projectionMatrix,
    uViewMatrix: camera.viewMatrix,
  },
};

const onResize = () => {
  const W = window.innerWidth;
  const H = window.innerHeight;
  viewport = [(W - vw) / 2, (H - vh) / 2, vw, vh];
  ctx.set({ width: W, height: H})

  drawInViewport.viewport = drawInViewport.scissor = viewport;
};
window.addEventListener("resize", onResize);
onResize();

const tempMat = mat4.create();
const pos = [0, 0, 0, 0];

ctx.frame(() => {
  ctx.submit(clearCmd);

  ctx.submit(drawInViewport, () => {
    cubes.forEach(({ modelMatrix, normalMatrix, position, label }) => {
      // normal matrix = inverse transpose of model view matrix
      // you can just pass mat3(viewMatrix) if you scaling is uniform
      mat4.identity(tempMat);
      mat4.mult(tempMat, modelMatrix);
      mat4.mult(tempMat, camera.viewMatrix);
      mat4.invert(tempMat);
      mat4.transpose(tempMat);
      mat3.fromMat4(normalMatrix, tempMat);

      // more info at MDN
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection

      // model space to world space
      // just convert vec3 to vec4, we need 'w' compoent
      // we assume model position is [0, 0, 0] so world position is c.position
      // we could also transform 0,0,0 point by model matrix
      // vec4.multMat4([0, 0, 0, 1], c.modelMatrix)
      vec4.fromVec3(pos, position);
      pos[3] = 1; // vec4 bug fix

      // world space to view space
      vec4.multMat4(pos, camera.viewMatrix);

      // view space to clip space
      vec4.multMat4(pos, camera.projectionMatrix);

      // homogeneous coordinates to cartesian coordinates
      // "When dividing by w, this can effectively increase the precision
      // of very large numbers by operating on two potentially smaller,
      // less error-prone numbers."
      // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
      const w = pos[3];
      if (w !== 0) {
        pos[0] /= w;
        pos[1] /= w;
        pos[2] /= w;
      }

      // homogeneous coordinates [-1, 1] to normalized [0, 1]
      // note that we multiply y by -0.5 because in WebGL Y axis increases up
      // and in HTML / Canvas it increases from top to bottom
      pos[0] = pos[0] * 0.5 + 0.5;
      pos[1] = pos[1] * -0.5 + 0.5;

      // normalized to screen coordinates
      pos[0] = viewport[0] + pos[0] * viewport[2];
      pos[1] = viewport[1] + pos[1] * viewport[3];

      label.style.left = `${pos[0]}px`;
      label.style.top = `${pos[1]}px`;

      ctx.submit(drawCubeCmd, {
        uniforms: {
          uModelMatrix: modelMatrix,
          uNormalMatrix: normalMatrix,
        },
      });
    });
  });

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
