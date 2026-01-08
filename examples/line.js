import createContext from "../index.js";
import { mat4 } from "pex-math";
import createGUI from "pex-gui";

import lineInterleavedVert from "./shaders/line-interleaved.vert.js";
import lineInterleavedTerminalVert from "./shaders/line-interleaved-terminal.vert.js";
import lineMiterJoinVert from "./shaders/line-miter-join.vert.js";
import lineBevelJoinVert from "./shaders/line-bevel-join.vert.js";
import lineRoundJoinVert from "./shaders/line-round-join.vert.js";
import lineCapVert from "./shaders/line-cap.vert.js";
import lineFrag from "./shaders/line.frag.js";

const W = 640;
const H = 480;
const ctx = createContext({ width: W, height: H, debug: true });

const gui = createGUI(ctx);
gui.addFPSMeeter();

const State = {
  join: "miter",
  cap: "round",
  terminal: true,
  alpha: 0.8,
  color: true,
  width: W * 0.05,
};

gui.addRadioList("Join Type", State, "join", [
  { name: "Miter", value: "miter" },
  { name: "Bevel", value: "bevel" },
  { name: "Round", value: "round" },
  { name: "None", value: "none" },
]);
gui.addRadioList("Cap Type", State, "cap", [
  { name: "Round", value: "round" },
  { name: "Square", value: "square" },
  { name: "None", value: "none" },
]);
gui.addParam("Terminal Segments", State, "terminal");
gui.addParam("Colored", State, "color");
gui.addParam("Alpha", State, "alpha", { min: 0.1, max: 1.0, step: 0.01 });
gui.addParam("Line Width", State, "width", { min: 1, max: 50, step: 1 });

function generateSamplePoints() {
  const points = [];
  const stepx = W / 9;
  const stepy = H / 10;

  for (let x = 1; x < 9; x += 2) {
    points.push([(x + 0) * stepx - W / 2, 3 * stepy - H / 2]);
    points.push([(x + 0.5) * stepx - W / 2, 5 * stepy - H / 2]);
    points.push([(x + 1) * stepx - W / 2, 7 * stepy - H / 2]);
  }

  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];

  points.push([lastX, lastY - stepy * 2]);
  points.push([lastX - stepx * 4, lastY - stepy * 2]);

  return points;
}

const points = generateSamplePoints();

const stripGeometry = {
  positions: [
    [0, -0.5],
    [1, -0.5],
    [1, 0.5],
    [0, 0.5],
  ],
  cells: [
    [0, 1, 2],
    [0, 2, 3],
  ],
};

const miterJoinGeometry = {
  positions: [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ],
  cells: [
    [0, 1, 2],
    [0, 2, 3],
  ],
};

const bevelJoinGeometry = {
  positions: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  cells: null,
};

function createRoundJoinGeometry(resolution = 16) {
  const ids = [];
  const cells = [];

  for (let i = 0; i < resolution + 2; i++) {
    ids.push(i);
  }

  for (let i = 0; i < resolution; i++) {
    cells.push([0, i + 1, i + 2]);
  }

  return { ids, cells };
}

const roundJoinGeometry = createRoundJoinGeometry(16);

function createRoundCapGeometry(resolution = 16) {
  const positions = [[0, 0]];
  for (let i = 0; i <= resolution; i++) {
    const theta = -0.5 * Math.PI + (Math.PI * i) / resolution;
    positions.push([0.5 * Math.cos(theta), 0.5 * Math.sin(theta)]);
  }
  const cells = [];
  for (let i = 0; i < resolution; i++) {
    cells.push([0, i + 1, i + 2]);
  }
  return { positions, cells };
}

const squareCapGeometry = {
  positions: [
    [0, 0.5],
    [0, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
  ],
  cells: [
    [0, 1, 2],
    [0, 2, 3],
  ],
};

const roundCapGeometry = createRoundCapGeometry(16);

const projection = mat4.ortho(
  mat4.create(),
  -W / 2,
  W / 2,
  -H / 2,
  H / 2,
  0,
  -1,
);

const clearCmd = {
  pass: ctx.pass({
    clearColor: [0.1, 0.1, 0.1, 1],
    clearDepth: 1,
  }),
};

const interleavedStripCmd = {
  pipeline: ctx.pipeline({
    vert: lineInterleavedVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(stripGeometry.positions),
    pA: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pB: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
    },
    pC: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 4,
    },
    pD: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 6,
    },
  },
  indices: ctx.indexBuffer(stripGeometry.cells),
  uniforms: {
    width: State.width,
    color: [1, 0, 0, 0.8],
    projection,
  },
  instances: points.length - 3,
  viewport: [0, 0, W, H],
};

const terminalPointsBuffer = ctx.vertexBuffer([
  points[0][0],
  points[0][1],
  points[1][0],
  points[1][1],
  points[2][0],
  points[2][1],
  points[points.length - 1][0],
  points[points.length - 1][1],
  points[points.length - 2][0],
  points[points.length - 2][1],
  points[points.length - 3][0],
  points[points.length - 3][1],
]);

const interleavedStripTerminalCmd = {
  pipeline: ctx.pipeline({
    vert: lineInterleavedTerminalVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(stripGeometry.positions),
    pA: {
      buffer: terminalPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
      stride: Float32Array.BYTES_PER_ELEMENT * 6,
    },
    pB: {
      buffer: terminalPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
      stride: Float32Array.BYTES_PER_ELEMENT * 6,
    },
    pC: {
      buffer: terminalPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 4,
      stride: Float32Array.BYTES_PER_ELEMENT * 6,
    },
  },
  indices: ctx.indexBuffer(stripGeometry.cells),
  uniforms: {
    width: State.width,
    color: [0, 0.5, 0, 0.8],
    projection,
  },
  instances: 2,
  viewport: [0, 0, W, H],
};

const miterJoinCmd = {
  pipeline: ctx.pipeline({
    vert: lineMiterJoinVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(miterJoinGeometry.positions),
    pointA: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pointB: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
    },
    pointC: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 4,
    },
  },
  indices: ctx.indexBuffer(miterJoinGeometry.cells),
  uniforms: {
    width: State.width,
    color: [0, 0, 1, 0.8],
    projection,
  },
  instances: points.length - 2,
  viewport: [0, 0, W, H],
};

const bevelJoinCmd = {
  pipeline: ctx.pipeline({
    vert: lineBevelJoinVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(bevelJoinGeometry.positions),
    pointA: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pointB: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
    },
    pointC: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 4,
    },
  },
  count: bevelJoinGeometry.positions.length,
  uniforms: {
    width: State.width,
    color: [0, 0, 1, 0.8],
    projection,
  },
  instances: points.length - 2,
  viewport: [0, 0, W, H],
};

const roundJoinCmd = {
  pipeline: ctx.pipeline({
    vert: lineRoundJoinVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    id: {
      buffer: ctx.vertexBuffer(roundJoinGeometry.ids),
      divisor: 0,
    },
    pointA: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
    },
    pointB: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
    },
    pointC: {
      buffer: ctx.vertexBuffer(points.flat()),
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 4,
    },
  },
  indices: ctx.indexBuffer(roundJoinGeometry.cells),
  uniforms: {
    width: State.width,
    color: [0, 0, 1, 0.8],
    projection,
  },
  instances: points.length - 2,
  viewport: [0, 0, W, H],
};

const capPointsBuffer = ctx.vertexBuffer([
  points[0][0],
  points[0][1],
  points[1][0],
  points[1][1],
  points[points.length - 1][0],
  points[points.length - 1][1],
  points[points.length - 2][0],
  points[points.length - 2][1],
]);

const squareCapCmd = {
  pipeline: ctx.pipeline({
    vert: lineCapVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(squareCapGeometry.positions),
    pA: {
      buffer: capPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
      stride: Float32Array.BYTES_PER_ELEMENT * 4,
    },
    pB: {
      buffer: capPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
      stride: Float32Array.BYTES_PER_ELEMENT * 4,
    },
  },
  indices: ctx.indexBuffer(squareCapGeometry.cells),
  uniforms: {
    width: State.width,
    color: [1, 0, 1, 0.8],
    projection,
  },
  instances: 2,
  viewport: [0, 0, W, H],
};

const roundCapCmd = {
  pipeline: ctx.pipeline({
    vert: lineCapVert,
    frag: lineFrag,
    depthTest: false,
    blend: true,
    blendSrcRGBFactor: ctx.BlendFactor.SrcAlpha,
    blendSrcAlphaFactor: ctx.BlendFactor.One,
    blendDstRGBFactor: ctx.BlendFactor.OneMinusSrcAlpha,
    blendDstAlphaFactor: ctx.BlendFactor.One,
    cullFace: false,
  }),
  attributes: {
    position: ctx.vertexBuffer(roundCapGeometry.positions),
    pA: {
      buffer: capPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 0,
      stride: Float32Array.BYTES_PER_ELEMENT * 4,
    },
    pB: {
      buffer: capPointsBuffer,
      divisor: 1,
      offset: Float32Array.BYTES_PER_ELEMENT * 2,
      stride: Float32Array.BYTES_PER_ELEMENT * 4,
    },
  },
  indices: ctx.indexBuffer(roundCapGeometry.cells),
  uniforms: {
    width: State.width,
    color: [1, 0, 1, 0.8],
    projection,
  },
  instances: 2,
  viewport: [0, 0, W, H],
};

window.addEventListener("keydown", ({ key }) => {
  if (key === "g") gui.enabled = !gui.enabled;
});

ctx.frame(() => {
  ctx.submit(clearCmd);

  interleavedStripCmd.uniforms.width = State.width;
  interleavedStripCmd.uniforms.color = State.color
    ? [1, 0, 0, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  interleavedStripTerminalCmd.uniforms.width = State.width;
  interleavedStripTerminalCmd.uniforms.color = State.color
    ? [0, 0.5, 0, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  miterJoinCmd.uniforms.width = State.width;
  miterJoinCmd.uniforms.color = State.color
    ? [0, 0, 1, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  bevelJoinCmd.uniforms.width = State.width;
  bevelJoinCmd.uniforms.color = State.color
    ? [0, 0, 1, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  roundJoinCmd.uniforms.width = State.width;
  roundJoinCmd.uniforms.color = State.color
    ? [0, 0, 1, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  squareCapCmd.uniforms.width = State.width;
  squareCapCmd.uniforms.color = State.color
    ? [1, 0, 1, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  roundCapCmd.uniforms.width = State.width;
  roundCapCmd.uniforms.color = State.color
    ? [1, 0, 1, State.alpha]
    : [0.25, 0.25, 0.25, State.alpha];

  ctx.submit(interleavedStripCmd);

  if (State.terminal) {
    ctx.submit(interleavedStripTerminalCmd);
  }

  const joinCommands = {
    miter: miterJoinCmd,
    bevel: bevelJoinCmd,
    round: roundJoinCmd,
    none: null,
  };

  const selectedJoin = joinCommands[State.join];
  if (selectedJoin) {
    ctx.submit(selectedJoin);
  }

  const capCommands = {
    round: roundCapCmd,
    square: squareCapCmd,
    none: null,
  };

  const selectedCap = capCommands[State.cap];
  if (selectedCap) {
    ctx.submit(selectedCap);
  }

  ctx.debug(false);

  gui.draw();

  window.dispatchEvent(new CustomEvent("screenshot"));
});
