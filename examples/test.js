import createContext from "../index.js";

import baboon from "baboon-image-uri";
import { loadImage } from "pex-io";

import testVert from "./shaders/test.vert.js";
import screenImageFrag from "./shaders/screen-image.frag.js";

import { es300Fragment } from "./utils.js";

const ctx = createContext();
const ctxWebGL1 = createContext({ type: "webgl", width: 2, height: 2 });

/**
 * Texture
 */
const tex = ctx.texture2D({
  data: new Uint8Array([0, 0, 0, 0]),
  width: 1,
  height: 1,
});
console.assert(tex.type === ctx.DataType.Uint8);
console.assert(tex.class === "texture", "Wrong texture class");

console.assert(
  ctx.state.activeTextures[0] === tex,
  "Creating texture should be remembered in active state",
);

Object.keys(ctx.PixelFormat)
  .filter((f) => !["Depth", "Depth16", "Depth24"].includes(f))
  .forEach((pixelFormat) => {
    ctx.texture2D({ width: 1, height: 1, pixelFormat: pixelFormat });

    // Supported WebGLtypes
    // prettier-ignore
    if (
      pixelFormat !== "DEPTH_COMPONENT32F" &&
      (
        // Is default supported format
        [
          "RGBA",
          "RGB",
          "LUMINANCE_ALPHA",
          "LUMINANCE",
          "ALPHA",
        ].includes(pixelFormat) ||
        // Float texture
        (
          ctxWebGL1.capabilities.textureFloat && // Has float extension
          pixelFormat !== "RGB32F" && // RGB32F support not guaranteed by the extension
          ctxWebGL1.TextureFormat[pixelFormat][0] && // Known texture format
          ctxWebGL1.TextureFormat[pixelFormat][1] === ctxWebGL1.DataType.Float32 // Type is float
        ) ||
        // Half texture
        (
          ctxWebGL1.capabilities.textureHalfFloat && // Has float extension
          pixelFormat !== "RGB16F" && // RGB16F support not guaranteed by the extension
          ctxWebGL1.TextureFormat[pixelFormat][0] && // Known texture format
          ctxWebGL1.TextureFormat[pixelFormat][1] === ctxWebGL1.DataType.Float16 // Type is half float
        )
      )
    ) {
      ctxWebGL1.texture2D({pixelFormat, width: 1, height: 1 });
    }
  });

// update with array, should default to Uint8
// const tex2 = ctx.texture2D({ data: [0, 0, 0, 0], width: 1, height: 1 })

/**
 * Buffers
 */
// Defaults
const vertexBufferDefault = {
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
  aTypedArrayBuffer: ctx.vertexBuffer(
    new Float32Array([0, 1, 2, 3, 4, 5]).buffer,
  ),
  aDataTypedArrayBuffer: ctx.vertexBuffer({
    data: new Float32Array([0, 1, 2, 3, 4, 5]).buffer,
  }),
};
Object.values(vertexBufferDefault).forEach((buffer, i) => {
  console.assert(
    buffer.length === 6,
    `${i} - Invalid vertex buffer length: ${buffer.length}`,
  );
  console.assert(
    buffer.type === ctx.DataType.Float32,
    `${i} - Invalid vertex buffer data type: ${buffer.type}`,
  );
  console.assert(
    buffer.target === ctx.gl.ARRAY_BUFFER,
    `${i} - Invalid vertex buffer target: ${buffer.target} != ${ctx.gl.ARRAY_BUFFER}`,
  );
});

const indexBuffers = {
  aFlatArray: ctx.indexBuffer([0, 1, 2, 3, 4, 5]),
  aElementArray: ctx.indexBuffer([
    [0, 1, 2],
    [3, 4, 5],
  ]),
  aTypedArray: ctx.indexBuffer(new Uint16Array([0, 1, 2, 3, 4, 5])),
  aDataArray: ctx.indexBuffer({ data: [0, 1, 2, 3, 4, 5] }),
  aDataElementArray: ctx.indexBuffer({
    data: [
      [0, 1, 2],
      [3, 4, 5],
    ],
  }),
  aDataTypedArray: ctx.indexBuffer({
    data: new Uint16Array([0, 1, 2, 3, 4, 5]),
  }),
  aTypedArrayBuffer: ctx.indexBuffer(
    new Uint16Array([0, 1, 2, 3, 4, 5]).buffer,
  ),
  aDataTypedArrayBuffer: ctx.indexBuffer({
    data: new Uint16Array([0, 1, 2, 3, 4, 5]).buffer,
  }),
};
Object.values(indexBuffers).forEach((buffer, i) => {
  console.assert(
    buffer.length === 6,
    `${i} - Invalid index buffer length: ${buffer.length}`,
  );
  console.assert(
    buffer.type === ctx.DataType.Uint16,
    `${i} - Invalid index buffer data type: ${buffer.type}`,
  );
  console.assert(
    buffer.target === ctx.gl.ELEMENT_ARRAY_BUFFER,
    `${i} - Invalid index buffer target: ${buffer.target} != ${ctx.gl.ELEMENT_ARRAY_BUFFER}`,
  );
});

// Buffer type
const indexBuffersTypes = {
  [ctx.DataType.Float32]: ctx.indexBuffer(new Float32Array([0, 1, 2, 3, 4, 5])), // TODO: is that allowed?
  [ctx.DataType.Int8]: ctx.indexBuffer(new Int8Array([0, 1, 2, 3, 4, 5])),
  [ctx.DataType.Uint8]: ctx.indexBuffer(new Uint8Array([0, 1, 2, 3, 4, 5])),
  [ctx.DataType.Uint16]: ctx.indexBuffer(new Uint16Array([0, 1, 2, 3, 4, 5])),
  [ctx.DataType.Uint32]: ctx.indexBuffer(new Uint32Array([0, 1, 2, 3, 4, 5])),
};
Object.entries(indexBuffersTypes).forEach(([type, buffer], i) => {
  console.assert(
    buffer.type === parseInt(type),
    `${i} - Invalid index buffer data type: ${buffer.type}`,
  );
});
const indexBuffersTypeOption = {
  [ctx.DataType.Float32]: ctx.indexBuffer({
    data: [0, 1, 2, 3, 4, 5],
    type: ctx.DataType.Float32,
  }),
  [ctx.DataType.Int8]: ctx.indexBuffer({
    data: [0, 1, 2, 3, 4, 5],
    type: ctx.DataType.Int8,
  }),
  [ctx.DataType.Uint8]: ctx.indexBuffer({
    data: [0, 1, 2, 3, 4, 5],
    type: ctx.DataType.Uint8,
  }),
  [ctx.DataType.Uint16]: ctx.indexBuffer({
    data: [0, 1, 2, 3, 4, 5],
    type: ctx.DataType.Uint16,
  }),
  [ctx.DataType.Uint32]: ctx.indexBuffer({
    data: [0, 1, 2, 3, 4, 5],
    type: ctx.DataType.Uint32,
  }),

  // typed array constructor has priority
  [ctx.DataType.Float32]: ctx.indexBuffer({
    data: new Float32Array([0, 1, 2, 3, 4, 5]),
    type: ctx.DataType.Uint32,
  }),
  [ctx.DataType.Int8]: ctx.indexBuffer({
    data: new Int8Array([0, 1, 2, 3, 4, 5]),
    type: ctx.DataType.Uint32,
  }),
  [ctx.DataType.Uint8]: ctx.indexBuffer({
    data: new Uint8Array([0, 1, 2, 3, 4, 5]),
    type: ctx.DataType.Uint32,
  }),
  [ctx.DataType.Uint16]: ctx.indexBuffer({
    data: new Uint16Array([0, 1, 2, 3, 4, 5]),
    type: ctx.DataType.Uint32,
  }),
  [ctx.DataType.Uint32]: ctx.indexBuffer({
    data: new Uint32Array([0, 1, 2, 3, 4, 5]),
    type: ctx.DataType.Uint16,
  }),

  // ArrayBuffer as data type
  [ctx.DataType.Float32]: ctx.indexBuffer({
    data: new Float32Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Float32,
  }),
  [ctx.DataType.Int8]: ctx.indexBuffer({
    data: new Int8Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Int8,
  }),
  [ctx.DataType.Uint8]: ctx.indexBuffer({
    data: new Uint8Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Uint8,
  }),
  [ctx.DataType.Uint16]: ctx.indexBuffer({
    data: new Uint16Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Uint16,
  }),
  [ctx.DataType.Uint32]: ctx.indexBuffer({
    data: new Uint32Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Uint32,
  }),

  // ArrayBuffer as data type override type
  [ctx.DataType.Uint32]: ctx.indexBuffer({
    data: new Uint16Array([0, 1, 2, 3, 4, 5]).buffer,
    type: ctx.DataType.Uint32,
  }),
};
Object.entries(indexBuffersTypeOption).forEach(([type, buffer], i) => {
  console.assert(
    buffer.type === parseInt(type),
    `${i} - Invalid index buffer data type: ${buffer.type}`,
  );
});

const bufferUpdateToTypedArray = ctx.vertexBuffer([0, 1, 2, 3, 4, 5]);
ctx.update(bufferUpdateToTypedArray, { data: [0, 1, 2, 3, 4, 5] });
console.assert(
  bufferUpdateToTypedArray.type === ctx.DataType.Float32,
  `Invalid vertex buffer data type: ${bufferUpdateToTypedArray.type}`,
);
ctx.update(bufferUpdateToTypedArray, {
  data: new Uint16Array([0, 1, 2, 3, 4, 5]),
});
console.assert(
  bufferUpdateToTypedArray.type === ctx.DataType.Uint16,
  `Invalid vertex buffer data type: ${bufferUpdateToTypedArray.type}`,
);
const bufferUpdateToArrayOfArrays = ctx.vertexBuffer(
  new Uint16Array([0, 1, 2, 3, 4, 5]),
);
ctx.update(bufferUpdateToArrayOfArrays, {
  data: new Uint16Array([0, 1, 2, 3, 4, 5]),
});
console.assert(
  bufferUpdateToArrayOfArrays.type === ctx.DataType.Uint16,
  `Invalid vertex buffer data type: ${bufferUpdateToArrayOfArrays.type}`,
);
ctx.update(bufferUpdateToArrayOfArrays, { data: [0, 1, 2, 3, 4, 5] });
console.assert(
  bufferUpdateToArrayOfArrays.type === ctx.DataType.Float32,
  `Invalid vertex buffer data type: ${bufferUpdateToArrayOfArrays.type}`,
);

/**
 * VAO
 */
const vertexLayout = Object.fromEntries(
  Object.entries(vertexBufferDefault).map(([key], index) => [
    key,
    { location: index, type: "vec3" },
  ]),
);

ctx.vertexArray({
  vertexLayout,
  attributes: vertexBufferDefault,
});

/**
 * PIPELINE
 */
const pipeline = ctx.pipeline({
  vert: /* glsl */ `
    attribute vec3 aPosition0;
    attribute vec3 aPosition1;
    void main () {
      gl_Position = vec4(aPosition1, 1.0);
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
    aPosition1: { buffer: ctx.vertexBuffer([0, 1, 0]) },
  },
  uniforms: {
    texture: tex,
  },
  indices: ctx.indexBuffer([0]),
});

console.assert(
  ctx.state.activeTextures[0] === tex,
  "Using texture should be remembered in active state",
);

/**
 * UNIFORMS
 */
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

/**
 * RENDERBUFFER
 */

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
// Support not guaranteed
// ctxWebGL1.renderbuffer({ pixelFormat: ctxWebGL1.PixelFormat.RGB16F });
// ctxWebGL1.renderbuffer({ pixelFormat: ctxWebGL1.PixelFormat.RGB32F });
// ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RGB16F });
// ctx.renderbuffer({ pixelFormat: ctx.PixelFormat.RGB32F });

/**
 * TRANSFORM-FEEDBACK
 */
console.log(vertexBufferDefault);

const transformFeedbackVarying = ctx.vertexBuffer([0, 1, 2, 3, 4, 5]);
ctx.transformFeedback({
  varyings: {
    aVarying: transformFeedbackVarying,
  },
});

setTimeout(() => {
  console.info("ctx.dispose()");
  ctx.dispose();
}, 3000);
