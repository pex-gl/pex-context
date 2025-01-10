import { enableVertexData } from "./utils.js";

/**
 * @typedef {import("./types.js").PexResource} VertexArrayOptions
 * @property {object} vertexLayout
 * @property {object} [attributes]
 * @property {object} [indices]
 */

function createVertexArray(ctx, opts) {
  const gl = ctx.gl;

  const vertexArray = {
    class: "vertexArray",
    handle: gl.createVertexArray(),
    _update: updateVertexArray,
    _dispose() {
      gl.deleteVertexArray(this.handle);
      this.handle = null;
    },
    ...opts,
  };

  updateVertexArray(ctx, vertexArray, opts);

  return vertexArray;
}

const TYPE_TO_SIZE = {
  float: 1,
  vec2: 2,
  vec3: 3,
  vec4: 4,
  mat3: 12,
  mat4: 16,
};

// TODO: can't update attributes/indices as they're in vertexArray
function updateVertexArray(ctx, vertexArray, { vertexLayout }) {
  const gl = ctx.gl;
  gl.bindVertexArray(vertexArray.handle);

  enableVertexData(
    ctx,
    Object.entries(vertexLayout).map(([name, { location, type, size }]) => [
      name,
      location,
      size ?? TYPE_TO_SIZE[type],
    ]),
    vertexArray,
  );

  gl.bindVertexArray(null);
}

export default createVertexArray;
