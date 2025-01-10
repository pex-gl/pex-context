import { checkProps } from "./utils.js";

/**
 * @typedef {import("./types.js").PexResource} TransformFeedbackOptions
 * @property {object} varyings
 */

const allowedProps = ["varyings", "bufferMode", "primitiveMode"];

function createTransformFeedback(ctx, opts) {
  const gl = ctx.gl;

  const transformFeedback = {
    class: "transformFeedback",
    handle: gl.createTransformFeedback(),
    bufferMode: gl.SEPARATE_ATTRIBS,
    primitiveMode: gl.POINTS,
    _update: updateTransformFeedback,
    _dispose() {
      gl.deleteTransformFeedback(this.handle);
      this.handle = null;
    },
    ...opts,
  };

  updateTransformFeedback(ctx, transformFeedback, opts);

  return transformFeedback;
}

function updateTransformFeedback(ctx, transformFeedback, opts) {
  checkProps(allowedProps, opts);

  const gl = ctx.gl;

  gl.bindVertexArray(null);

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transformFeedback.handle);

  let index = 0;
  for (let varyingName in opts.varyings) {
    gl.bindBufferBase(
      gl.TRANSFORM_FEEDBACK_BUFFER,
      index++,
      opts.varyings[varyingName].handle,
    );
  }

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
}

export default createTransformFeedback;
