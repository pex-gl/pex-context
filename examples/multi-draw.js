import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { cube, sphere, torus } from "primitive-geometry";
import merge from "geom-merge";

import basicFrag from "./shaders/basic.frag.js";

const ctx = createContext({ pixelRatio: devicePixelRatio });

const CellsConstructor = Uint16Array;

const sphereGeometry = sphere();
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value - 1.25 : value
);
const cubeGeometry = cube();

const torusGeometry = torus();
torusGeometry.positions = torusGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value + 1.25 : value
);
const geometries = [sphereGeometry, cubeGeometry, torusGeometry];
const geometry = merge(geometries);

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

const counts = new Int32Array(geometries.length);
const offsets = new Int32Array(geometries.length);

for (let i = 0; i < geometries.length; i++) {
  counts[i] = geometries[i].cells.length;

  if (i > 0) {
    offsets[i] =
      offsets[i - 1] +
      geometries[i - 1].cells.length * CellsConstructor.BYTES_PER_ELEMENT;
  }
}

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: /* glsl */ `
#extension GL_ANGLE_multi_draw: require

attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec4 vColor;

void main () {
  if (gl_DrawID == 0) {
    vColor = vec4(1.0, 0.0, 0.0, 1.0);
  } else if (gl_DrawID == 1) {
    vColor = vec4(0.0, 1.0, 0.0, 1.0);
  } else if (gl_DrawID == 2) {
    vColor = vec4(0.0, 0.0, 1.0, 1.0);
  } else {
    vColor = vec4(1.0, 1.0, 0.0, 1.0);
  }

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}`,
    frag: basicFrag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geometry.positions),
  },
  indices: ctx.indexBuffer(geometry.cells),
  multiDraw: {
    counts,
    offsets,
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
