import createContext from "../index.js";

import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

import { plane, cube, sphere, torus } from "primitive-geometry";
import merge from "geom-merge";
import splitVertices from "geom-split-vertices";

import basicFrag from "./shaders/basic.frag.js";

const ctx = createContext({ pixelRatio: devicePixelRatio });

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

const unindexed = true;

// Create geometries
const planeGeometry = plane();
const sphereGeometry = sphere();
sphereGeometry.positions = sphereGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value - 1.25 : value
);
const torusGeometry = torus();
const cubeGeometry = cube();
cubeGeometry.positions = cubeGeometry.positions.map((value, i) =>
  i % 3 === 0 ? value + 1.25 : value
);
const geometries = [
  planeGeometry,
  sphereGeometry,
  torusGeometry,
  cubeGeometry,
].map((geometry) =>
  unindexed ? splitVertices(geometry.positions, geometry.cells) : geometry
);

const geometry = merge(geometries);

// Create multidraw
const counts = new Int32Array(geometries.length);
const offsets = new Int32Array(geometries.length);
const firsts = new Int32Array(geometries.length);

if (unindexed) {
  for (let i = 0; i < geometries.length; i++) {
    counts[i] = geometries[i].positions.length / 3;

    if (i > 0) firsts[i] = firsts[i - 1] + counts[i - 1];
  }
} else {
  for (let i = 0; i < geometries.length; i++) {
    counts[i] = geometries[i].cells.length;

    if (i > 0) {
      offsets[i] =
        offsets[i - 1] +
        counts[i - 1] * geometry.cells.constructor.BYTES_PER_ELEMENT;
    }
  }
}
console.log("geometry", geometry);
console.log("counts", counts);
console.log("offsets", offsets);
console.log("firsts", firsts);

const drawCmd = {
  pipeline: ctx.pipeline({
    depthTest: true,
    vert: /* glsl */ `
${ctx.capabilities.multiDraw ? "#define USE_MULTI_DRAW" : ""}
#ifdef USE_MULTI_DRAW
  #extension GL_ANGLE_multi_draw: require
#endif

attribute vec3 aPosition;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

varying vec4 vColor;

void main () {
  #ifdef USE_MULTI_DRAW
    if (gl_DrawID == 0) {
      vColor = vec4(1.0, 0.5, 0.5, 1.0);
    } else if (gl_DrawID == 1) {
      vColor = vec4(0.5, 1.0, 0.5, 1.0);
    } else if (gl_DrawID == 2) {
      vColor = vec4(0.5, 0.5, 1.0, 1.0);
    } else {
      vColor = vec4(1.0, 1.0, 0.5, 1.0);
    }
  #else
    vColor = vec4(1.0, 1.0, 1.0, 1.0);
  #endif

  gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}`,
    frag: basicFrag,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(geometry.positions),
  },
  // ...(unindexed
  //   ? { count: geometry.positions.length / 3 }
  //   : { indices: ctx.indexBuffer(geometry.cells) }),

  ...(unindexed
    ? {
        multiDraw: {
          firsts,
          counts,
          firstsOffset: 1,
          countsOffset: 1,
          drawCount: geometries.length - 1,
        },
      }
    : {
        indices: ctx.indexBuffer(geometry.cells),
        multiDraw: {
          counts,
          offsets,
          // Ignore first geometry to test offsets
          countsOffset: 1,
          offsetsOffset: 1,
          drawCount: geometries.length - 1,
        },
      }),
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
