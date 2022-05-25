// Debug
const NAMESPACE = "\x1b[31mpex-context\x1b[39m";

const checkProps = (allowedProps, obj) =>
  Object.keys(obj).forEach((prop) => {
    if (!allowedProps.includes(prop)) throw new Error(`Unknown prop "${prop}"`);
  });

const isWebGL2 = (gl) =>
  typeof WebGL2RenderingContext !== "undefined" &&
  gl instanceof WebGL2RenderingContext;

// State and gl
function compareFBOAttachments(framebuffer, passOpts) {
  const fboDepthAttachment = framebuffer.depth?.texture;
  const passDepthAttachment = passOpts.depth?.texture || passOpts.depth;
  if (fboDepthAttachment != passDepthAttachment) return false;
  if (framebuffer.color.length != passOpts.color.length) return false;

  for (let i = 0; i < framebuffer.color.length; i++) {
    const fboColorAttachment = framebuffer.color[i]?.texture;
    const passColorAttachment = passOpts.color[i]?.texture || passOpts.color[i];
    if (fboColorAttachment != passColorAttachment) return false;
  }

  return true;
}

function enableVertexData(ctx, vertexLayout, cmd, updateState) {
  const gl = ctx.gl;

  const { attributes = {}, indices } = cmd;

  for (let i = 0; i < ctx.capabilities.maxVertexAttribs; i++) {
    ctx.state.activeAttributes[i] = null;
    gl.disableVertexAttribArray(i);
  }

  for (let i = 0; i < vertexLayout.length; i++) {
    const [name, location, size] = vertexLayout[i];
    // TODO: is attributes array valid?
    const attrib = attributes[i] || attributes[name];

    if (!attrib) {
      console.debug(
        NAMESPACE,
        "invalid command",
        cmd,
        "doesn't satisfy vertex layout",
        vertexLayout
      );
      throw new Error(
        `Command is missing attribute "${name}" at location ${location} with ${attrib}`
      );
    }

    let buffer = attrib.buffer;
    if (!buffer && attrib.class === "vertexBuffer") {
      buffer = attrib;
    }

    if (!buffer || !buffer.target) {
      throw new Error(
        `Trying to draw arrays with invalid buffer for attribute : ${name}`
      );
    }

    gl.bindBuffer(buffer.target, buffer.handle);
    if (size === 16) {
      gl.enableVertexAttribArray(location + 0);
      gl.enableVertexAttribArray(location + 1);
      gl.enableVertexAttribArray(location + 2);
      gl.enableVertexAttribArray(location + 3);

      if (updateState) {
        ctx.state.activeAttributes[location + 0] = buffer;
        ctx.state.activeAttributes[location + 1] = buffer;
        ctx.state.activeAttributes[location + 2] = buffer;
        ctx.state.activeAttributes[location + 3] = buffer;
      }

      // TODO: is this still valid?
      // we still check for buffer type because while e.g. pex-renderer would copy buffer type to attrib, a raw pex-context example probably would not
      gl.vertexAttribPointer(
        location,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 0
      );
      gl.vertexAttribPointer(
        location + 1,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 16
      );
      gl.vertexAttribPointer(
        location + 2,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 32
      );
      gl.vertexAttribPointer(
        location + 3,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 48
      );
      const divisor = attrib.divisor || 0;
      gl.vertexAttribDivisor(location + 0, divisor);
      gl.vertexAttribDivisor(location + 1, divisor);
      gl.vertexAttribDivisor(location + 2, divisor);
      gl.vertexAttribDivisor(location + 3, divisor);
    } else {
      gl.enableVertexAttribArray(location);
      if (updateState) ctx.state.activeAttributes[location] = buffer;
      gl.vertexAttribPointer(
        location,
        size,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 0,
        attrib.offset || 0
      );
      gl.vertexAttribDivisor(location, attrib.divisor || 0);
    }
    // TODO: how to match index with vertexLayout location?
  }

  if (indices) {
    let indexBuffer = indices.buffer;
    if (!indexBuffer && indices.class === "indexBuffer") {
      indexBuffer = indices;
    }
    if (!indexBuffer || !indexBuffer.target) {
      console.debug(NAMESPACE, "invalid command", cmd, "buffer", indexBuffer);
      throw new Error(`Trying to draw arrays with invalid buffer for elements`);
    }
    if (updateState) ctx.state.indexBuffer = indexBuffer;

    gl.bindBuffer(indexBuffer.target, indexBuffer.handle);
  }
}

export {
  NAMESPACE,
  isWebGL2,
  checkProps,
  polyfill,
  compareFBOAttachments,
  enableVertexData,
};
