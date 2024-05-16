import createContext from "../index.js";

import { mat4 } from "pex-math";
import { perspective as createCamera, orbiter as createOrbiter } from "pex-cam";

const ctx = createContext({ debug: true });

const camera = createCamera({
  fov: Math.PI / 4,
  aspect: ctx.gl.canvas.width / ctx.gl.canvas.height,
  position: [0, 0, 10],
});

createOrbiter({ camera, element: ctx.gl.canvas, drag: false, maxDistance: 50 });

const VERT = /* glsl */ `
  attribute vec3 aPosition;

  uniform mat4 uProjectionMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uModelMatrix;

  void main () {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
    gl_PointSize = 5.0;
  }
`;
const FRAG = /* glsl */ `
  precision highp float;

  uniform vec4 uColor;
  void main () {
    gl_FragColor = uColor;
  }
`;

const corners = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
];

const drawPoints = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Points,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners),
  },
  indices: ctx.indexBuffer([0, 1, 2, 3]),
  uniforms: {
    uModelMatrix: mat4.translate(mat4.create(), [-4 - 0.5, -0.5, 0]),
  },
};

const drawLines = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Lines,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners),
  },
  indices: ctx.indexBuffer([
    [0, 1],
    [2, 3],
  ]),
  uniforms: {
    uModelMatrix: mat4.translate(mat4.create(), [-2 - 0.5, -0.5, 0]),
  },
};

const drawLineStrip = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.LineStrip,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners),
  },
  indices: ctx.indexBuffer([0, 1, 2, 3]),
  uniforms: {
    uModelMatrix: mat4.translate(mat4.create(), [0 - 0.5, -0.5, 0]),
  },
};

const drawTriangles = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.Triangles,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners),
  },
  indices: ctx.indexBuffer([[0, 1, 2]]),
  uniforms: {
    uModelMatrix: mat4.translate(mat4.create(), [2 - 0.5, -0.5, 0]),
  },
};

const drawTriangleStrip = {
  pipeline: ctx.pipeline({
    vert: VERT,
    frag: FRAG,
    depthTest: true,
    primitive: ctx.Primitive.TriangleStrip,
  }),
  attributes: {
    aPosition: ctx.vertexBuffer(corners),
  },
  indices: ctx.indexBuffer([0, 1, 3, 2]),
  uniforms: {
    uModelMatrix: mat4.translate(mat4.create(), [4 - 0.5, -0.5, 0]),
  },
};

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1.0],
    clearDepth: 1,
  }),
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
  const uniforms = {
    uniforms: {
      uProjectionMatrix: camera.projectionMatrix,
      uViewMatrix: camera.viewMatrix,
      uColor: [1, 1, 1, 1],
    },
  };
  ctx.submit(clearCmd);
  ctx.submit(drawPoints, uniforms);
  ctx.submit(drawLines, uniforms);
  ctx.submit(drawLineStrip, uniforms);
  ctx.submit(drawTriangles, uniforms);
  ctx.submit(drawTriangleStrip, uniforms);

  ctx.debug(false);

  window.dispatchEvent(new CustomEvent("pex-screenshot"));
});
