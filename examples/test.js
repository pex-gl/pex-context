import createContext from "../index.js";

const ctx = createContext();

const tex = ctx.texture2D({
  data: new Uint8Array([0, 0, 0, 0]),
  width: 1,
  height: 1,
});
console.assert(tex.type === ctx.DataType.Uint8);
console.assert(tex.class === "texture", "Wrong texture class");

console.assert(
  ctx.state.activeTextures[0] === tex,
  "Creating texture should be remembered in active state"
);

// update with array, should default to Uint8
// const tex2 = ctx.texture2D({ data: [0, 0, 0, 0], width: 1, height: 1 })

const vertexBuffers = [
  ctx.vertexBuffer([0, 1, 2, 3, 4, 5]),
  ctx.vertexBuffer([
    [0, 1, 2],
    [3, 4, 5],
  ]),
  ctx.vertexBuffer(new Float32Array([0, 1, 2, 3, 4, 5])),
  ctx.vertexBuffer({ data: [0, 1, 2, 3, 4, 5] }),
  ctx.vertexBuffer({
    data: [
      [0, 1, 2],
      [3, 4, 5],
    ],
  }),
  ctx.vertexBuffer({ data: new Float32Array([0, 1, 2, 3, 4, 5]) }),
];

vertexBuffers.forEach(({ target }, i) => {
  console.assert(
    target === ctx.gl.ARRAY_BUFFER,
    `VertexBuffer ${i} type is wrong ${target} != ${ctx.gl.ARRAY_BUFFER}`
  );
});

const pipeline = ctx.pipeline({
  vert: /* glsl */ `
    attribute vec3 aPosition0;
    void main () {
      gl_Position = vec4(aPosition0, 1.0);
    }`,
  frag: /* glsl */ `
    precision mediump float;

    uniform sampler2D texture;

    void main () {
      gl_FragColor = vec4(1.0) + texture2D(texture, vec2(0.0));
    }`,
});

ctx.submit({
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
  pipeline,
  attributes: {
    // aPosition0: [0, 1, 0], // not supported yet
    // aPosition2: [[0, 1, 0]], // not supported yet
    aPosition0: ctx.vertexBuffer([0, 1, 0]),
    aPosition1: ctx.vertexBuffer([0, 1, 0]),
  },
  uniforms: {
    texture: tex,
  },
  indices: ctx.indexBuffer([0]),
});

console.assert(
  ctx.state.activeTextures[0] === tex,
  "Using texture should be remembered in active state"
);

setTimeout(() => {
  window.dispatchEvent(new CustomEvent("pex-screenshot"));
}, 1000);
