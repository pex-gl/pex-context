import createContext from "../index.js";

import baboon from "baboon-image-uri";
import { loadImage } from "pex-io";

import testVert from "./shaders/test.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

import { es300Fragment } from "./utils.js";

const ctx = createContext();
const ctxWebGL1 = createContext({ type: "webgl", width: 2, height: 2 });

// Texture
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

// Buffers
const vertexBuffers = {
  aFlatArray: ctx.vertexBuffer([0, 1, 2, 3, 4, 5]),
  aElementArray: ctx.vertexBuffer([
    [0, 1, 2],
    [3, 4, 5],
  ]),
  aTypedArray: ctx.vertexBuffer(new Float32Array([0, 1, 2, 3, 4, 5])),
  aDataArray: ctx.vertexBuffer({ data: [0, 1, 2, 3, 4, 5] }),
  aDataElementArray: ctx.vertexBuffer({
    data: [
      [0, 1, 2],
      [3, 4, 5],
    ],
  }),
  aDataTypedArray: ctx.vertexBuffer({
    data: new Float32Array([0, 1, 2, 3, 4, 5]),
  }),
};

Object.values(vertexBuffers).forEach(({ target }, i) => {
  console.assert(
    target === ctx.gl.ARRAY_BUFFER,
    `VertexBuffer ${i} type is wrong ${target} != ${ctx.gl.ARRAY_BUFFER}`
  );
});

// VAO
const vertexLayout = Object.fromEntries(
  Object.entries(vertexBuffers).map(([key], index) => [
    key,
    { location: index, type: "vec3" },
  ])
);

ctx.vertexArray({
  vertexLayout,
  attributes: vertexBuffers,
});

// Pipeline
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

// Uniforms
ctx.submit({
  pass: ctx.pass({
    clearColor: [0.2, 0.2, 0.2, 1],
    clearDepth: 1,
  }),
  pipeline: ctx.pipeline({
    vert: testVert,
    frag: es300Fragment(screenImageFrag),
  }),
  attributes: {
    aPosition: ctx.vertexBuffer([
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ]),
    aTexCoord: ctx.vertexBuffer([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ]),
  },
  indices: ctx.indexBuffer([
    [0, 1, 2],
    [0, 2, 3],
  ]),
  uniforms: {
    uTexture: ctx.texture2D({
      data: await loadImage(baboon),
      flipY: true,
    }),

    uInt: -1,
    uUint: 1,
    uBoolean: true,
    uFloat: 1.0,

    uFloatVec2: [1.0, 1.0],
    uFloatVec3: [1.0, 1.0, 1.0],
    uFloatVec4: [1.0, 1.0, 1.0, 1.0],

    uIntVec2: [-1, -1],
    uIntVec3: [-1, -1, -1],
    uIntVec4: [-1, -1, -1, -1],

    uUnsignedIntVec2: [1, 1],
    uUnsignedIntVec3: [1, 1, 1],
    uUnsignedIntVec4: [1, 1, 1, 1],

    uBoolVec2: [1, 1],
    uBoolVec3: [1, 1, 1],
    uBoolVec4: [1, 1, 1, 1],

    // prettier-ignore
    uFloatMat2: [
      1, 0,
      0, 1
    ],
    // prettier-ignore
    uFloatMat3: [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ],
    // prettier-ignore
    uFloatMat4: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    // prettier-ignore
    uFloatMat2x3: [
      1, 0,
      0, 1,
      0, 0,
    ],
    // prettier-ignore
    uFloatMat2x4: [
      1, 0,
      0, 1,
      0, 0,
      0, 0,
    ],
    // prettier-ignore
    uFloatMat3x2: [
      1, 0, 0,
      0, 1, 0,
    ],
    // prettier-ignore
    uFloatMat3x4: [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      0, 0, 0,
    ],
    // prettier-ignore
    uFloatMat4x2: [
      1, 0, 0, 0,
      0, 1, 0, 0,
    ],
    // prettier-ignore
    uFloatMat4x3: [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
    ],
  },
});

// Renderbuffer
ctxWebGL1.renderbuffer({ pixelFormat: ctxWebGL1.PixelFormat.RGBA16F });
ctxWebGL1.renderbuffer({ pixelFormat: ctxWebGL1.PixelFormat.RGBA32F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RGBA16F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RGBA32F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.R16F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RG16F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.R32F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RG32F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RGBA32F });
ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.R11F_G11F_B10F });
