import assert from "assert";
import { checkProps } from "./utils.js";

/**
 * @typedef {import("./index.js").PexResource} BufferOptions
 * @property {Array|TypedArray|ArrayBuffer} data pixel data
 * @property {ctx.DataType} [type]
 * @property {ctx.Usage} [usage=ctx.Usage.StaticDraw]
 * @property {number} offset data offset in the buffer (update only)
 * @property {boolean} normalized
 */

const allowedProps = [
  "target",
  "data",
  "usage",
  "type",
  "offset",
  "normalized",
];

function createBuffer(ctx, opts) {
  checkProps(allowedProps, opts);

  const gl = ctx.gl;
  assert(
    opts.target === gl.ARRAY_BUFFER || opts.target === gl.ELEMENT_ARRAY_BUFFER,
    "Invalid buffer target"
  );

  const buffer = {
    class: opts.target === gl.ARRAY_BUFFER ? "vertexBuffer" : "indexBuffer",
    handle: gl.createBuffer(),
    target: opts.target,
    usage: opts.usage || gl.STATIC_DRAW,
    _update: updateBuffer,
    _dispose() {
      gl.deleteBuffer(this.handle);
      this.handle = null;
    },
  };

  updateBuffer(ctx, buffer, opts);

  return buffer;
}

function updateBuffer(ctx, buffer, opts) {
  checkProps(allowedProps, opts);

  const gl = ctx.gl;
  let data = opts.data || opts;
  let type = opts.type || buffer.type;
  let offset = opts.offset || 0;

  if (Array.isArray(data)) {
    if (!type) {
      if (opts.target === gl.ARRAY_BUFFER) {
        type = ctx.DataType.Float32;
      }
      if (opts.target === gl.ELEMENT_ARRAY_BUFFER) {
        type = ctx.DataType.Uint16;
      }
    }

    const sourceData = data;
    const elemSize = Array.isArray(sourceData[0]) ? sourceData[0].length : 1;
    const size = elemSize * sourceData.length;

    if (type === ctx.DataType.Float32) {
      data = new Float32Array(elemSize === 1 ? sourceData : size);
    } else if (type === ctx.DataType.Uint8) {
      data = new Uint8Array(elemSize === 1 ? sourceData : size);
    } else if (type === ctx.DataType.Uint16) {
      data = new Uint16Array(elemSize === 1 ? sourceData : size);
    } else if (type === ctx.DataType.Uint32) {
      data = new Uint32Array(elemSize === 1 ? sourceData : size);
    } else if (type === ctx.DataType.Int8) {
      data = new Int8Array(elemSize === 1 ? sourceData : size);
    }

    if (elemSize > 1) {
      for (let i = 0; i < sourceData.length; i++) {
        for (let j = 0; j < elemSize; j++) {
          const index = i * elemSize + j;
          data[index] = sourceData[i][j];
        }
      }
    }
  } else if (data instanceof Float32Array) {
    type = ctx.DataType.Float32;
  } else if (data instanceof Uint8Array) {
    type = ctx.DataType.Uint8;
  } else if (data instanceof Uint16Array) {
    type = ctx.DataType.Uint16;
  } else if (data instanceof Uint32Array) {
    type = ctx.DataType.Uint32;
  } else if (data instanceof Int8Array) {
    type = ctx.DataType.Int8;
  } else if (data instanceof ArrayBuffer) {
    // assuming type was provided
  } else {
    throw new Error(`Unknown buffer data type: ${data.constructor}`);
  }

  buffer.type = type;

  // TODO: is this a valid guess?
  buffer.length =
    data.length ??
    data.byteLength / ctx.DataTypeConstructor[type].BYTES_PER_ELEMENT;

  // TODO: push state, and pop as this can modify existing VBO?
  gl.bindBuffer(buffer.target, buffer.handle);
  if (offset) {
    gl.bufferSubData(buffer.target, offset, data);
  } else {
    gl.bufferData(buffer.target, data, buffer.usage);
  }
}

export default createBuffer;
