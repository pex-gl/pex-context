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
const polyfill = (ctx) => {
  const { gl, capabilities } = ctx;

  if (!gl.HALF_FLOAT) {
    const ext = gl.getExtension("OES_texture_half_float");
    if (ext) gl.HALF_FLOAT = ext.HALF_FLOAT_OES;
  }

  if (!gl.createVertexArray) {
    const ext = gl.getExtension("OES_vertex_array_object");
    if (!ext) {
      gl.createVertexArray = function () {
        throw new Error("OES_vertex_array_object not supported");
      };
    } else {
      gl.createVertexArray = ext.createVertexArrayOES.bind(ext);
      gl.bindVertexArray = ext.bindVertexArrayOES.bind(ext);
      capabilities.vertexArrayObject = true;
    }
  } else {
    capabilities.vertexArrayObject = true;
  }

  if (!capabilities.disjointTimerQuery) {
    gl.TIME_ELAPSED ||= "TIME_ELAPSED";
    gl.GPU_DISJOINT ||= "GPU_DISJOINT";
    gl.QUERY_RESULT ||= "QUERY_RESULT";
    gl.QUERY_RESULT_AVAILABLE ||= "QUERY_RESULT_AVAILABLE";
    gl.createQuery ||= () => ({});
    gl.deleteQuery ||= () => {};
    gl.beginQuery ||= () => {};
    gl.endQuery ||= () => {};
    gl.getQueryParameter = (q, param) => {
      if (param === gl.QUERY_RESULT_AVAILABLE) return true;
      if (param === gl.QUERY_RESULT) return 0;
      return undefined;
    };
    gl.getQueryObject = gl.getQueryParameter;
  } else {
    const extDTQ = capabilities.isWebGL2
      ? gl.getExtension("EXT_disjoint_timer_query_webgl2")
      : gl.getExtension("EXT_disjoint_timer_query");
    gl.TIME_ELAPSED = extDTQ.TIME_ELAPSED_EXT;
    gl.GPU_DISJOINT = extDTQ.GPU_DISJOINT_EXT;
    gl.QUERY_RESULT ||= extDTQ.QUERY_RESULT_EXT;
    gl.QUERY_RESULT_AVAILABLE ||= extDTQ.QUERY_RESULT_AVAILABLE_EXT;
    gl.createQuery ||= extDTQ.createQueryEXT.bind(extDTQ);
    gl.deleteQuery ||= extDTQ.deleteQueryEXT.bind(extDTQ);
    gl.beginQuery ||= extDTQ.beginQueryEXT.bind(extDTQ);
    gl.endQuery ||= extDTQ.endQueryEXT.bind(extDTQ);
    gl.getQueryParameter ||= extDTQ.getQueryObjectEXT.bind(extDTQ);
  }

  if (!gl.drawElementsInstanced) {
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    if (!ext) {
      // TODO: this._caps[CAPS_INSTANCED_ARRAYS] = false;
      gl.drawElementsInstanced = () => {
        throw new Error(
          "gl.drawElementsInstanced not available. ANGLE_instanced_arrays not supported"
        );
      };
      gl.drawArraysInstanced = () => {
        throw new Error(
          "gl.drawArraysInstanced not available. ANGLE_instanced_arrays not supported"
        );
      };
      gl.vertexAttribDivisor = () => {
        throw new Error(
          "gl.vertexAttribDivisor not available. ANGLE_instanced_arrays not supported"
        );
      };
    } else {
      // TODO: this._caps[CAPS_INSTANCED_ARRAYS] = true;
      gl.drawElementsInstanced = ext.drawElementsInstancedANGLE.bind(ext);
      gl.drawArraysInstanced = ext.drawArraysInstancedANGLE.bind(ext);
      gl.vertexAttribDivisor = ext.vertexAttribDivisorANGLE.bind(ext);
      capabilities.instancedArrays = true;
      capabilities.instancing = true; // TODO: deprecate
    }
  } else {
    capabilities.instancedArrays = true;
    capabilities.instancing = true; // TODO: deprecate
  }

  if (!gl.drawBuffers) {
    const ext = gl.getExtension("WEBGL_draw_buffers");
    if (!ext) {
      gl.drawBuffers = () => {
        throw new Error("WEBGL_draw_buffers not supported");
      };
    } else {
      gl.drawBuffers = ext.drawBuffersWEBGL.bind(ext);
      capabilities.maxColorAttachments = gl.getParameter(
        ext.MAX_COLOR_ATTACHMENTS_WEBGL
      );
    }
  } else {
    capabilities.maxColorAttachments = gl.getParameter(
      gl.MAX_COLOR_ATTACHMENTS
    );
  }
};

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
      if (attrib.divisor) {
        gl.vertexAttribDivisor(location + 0, attrib.divisor);
        gl.vertexAttribDivisor(location + 1, attrib.divisor);
        gl.vertexAttribDivisor(location + 2, attrib.divisor);
        gl.vertexAttribDivisor(location + 3, attrib.divisor);
      } else if (ctx.capabilities.instancing) {
        gl.vertexAttribDivisor(location + 0, 0);
        gl.vertexAttribDivisor(location + 1, 0);
        gl.vertexAttribDivisor(location + 2, 0);
        gl.vertexAttribDivisor(location + 3, 0);
      }
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
      if (attrib.divisor) {
        gl.vertexAttribDivisor(location, attrib.divisor);
      } else if (ctx.capabilities.instancing) {
        gl.vertexAttribDivisor(location, 0);
      }
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
