// Debug
const NAMESPACE = "pex-context";

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
        vertexLayout,
      );
      throw new Error(
        `Command is missing attribute "${name}" at location ${location} with ${attrib}`,
      );
    }

    let buffer = attrib.buffer;
    if (!buffer && attrib.class === "vertexBuffer") {
      buffer = attrib;
    }

    if (!buffer || !buffer.target) {
      throw new Error(
        `Trying to draw arrays with invalid buffer for attribute : ${name}`,
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
        attrib.offset || 0,
      );
      gl.vertexAttribPointer(
        location + 1,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 16,
      );
      gl.vertexAttribPointer(
        location + 2,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 32,
      );
      gl.vertexAttribPointer(
        location + 3,
        4,
        attrib.type || buffer.type,
        attrib.normalized || false,
        attrib.stride || 64,
        attrib.offset || 48,
      );
      const divisor = attrib.divisor || 0;
      gl.vertexAttribDivisor(location + 0, divisor);
      gl.vertexAttribDivisor(location + 1, divisor);
      gl.vertexAttribDivisor(location + 2, divisor);
      gl.vertexAttribDivisor(location + 3, divisor);
    } else {
      gl.enableVertexAttribArray(location);
      if (updateState) ctx.state.activeAttributes[location] = buffer;
      let offset = attrib.offset || 0;
      const type = attrib.type || buffer.type;

      // Instanced Base fallback
      if (
        !ctx.capabilities.drawInstancedBase &&
        (cmd.baseInstance || cmd.baseVertex)
      ) {
        if (indices) {
          offset +=
            (attrib.divisor ? cmd.baseInstance : cmd.baseVertex) *
            size *
            ctx.DataTypeConstructor[type].BYTES_PER_ELEMENT;
        } else {
          if (attrib.divisor) offset += (cmd.count * cmd.baseInstance) / size;
        }
      }

      gl.vertexAttribPointer(
        location,
        size,
        type,
        attrib.normalized || false,
        attrib.stride || 0,
        offset,
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

function drawElements(ctx, cmd, instanced, primitive) {
  const gl = ctx.gl;

  // TODO: is that always correct
  const count = cmd.count || ctx.state.indexBuffer.length;
  const offset = cmd.indices?.offset || cmd.vertexArray?.indices?.offset || 0;
  const type =
    cmd.indices?.type ||
    cmd.vertexArray?.indices?.offset ||
    ctx.state.indexBuffer.type;

  // Instanced drawing
  if (instanced) {
    if (cmd.multiDraw) {
      if (ctx.capabilities.multiDraw) {
        // Multidraw elements instanced base
        if (
          ctx.capabilities.multiDrawInstancedBase &&
          (cmd.multiDraw.baseVertices || cmd.multiDraw.baseInstances)
        ) {
          const ext = gl.getExtension(
            "WEBGL_multi_draw_instanced_base_vertex_base_instance",
          );

          ext.multiDrawElementsInstancedBaseVertexBaseInstanceWEBGL(
            primitive,
            cmd.multiDraw.counts,
            cmd.multiDraw.countsOffset || 0,
            type,
            cmd.multiDraw.offsets,
            cmd.multiDraw.offsetsOffset || 0,
            cmd.multiDraw.instanceCounts,
            cmd.multiDraw.instanceCountsOffset || 0,
            cmd.multiDraw.baseVertices || [],
            cmd.multiDraw.baseVerticesOffset || 0,
            cmd.multiDraw.baseInstances || [],
            cmd.multiDraw.baseInstancesOffset || 0,
            cmd.multiDraw.drawCount || cmd.multiDraw.counts.length,
          );
        } else {
          // Multidraw elements instanced (or multidraw base fallback with offset from enableVertexData)
          const ext = gl.getExtension("WEBGL_multi_draw");

          // TODO: fallback
          if (cmd.multiDraw.baseVertices || cmd.multiDraw.baseInstances) {
            console.error("Unsupported multiDrawInstancedBase. No fallback.");
          }

          ext.multiDrawElementsInstancedWEBGL(
            primitive,
            cmd.multiDraw.counts,
            cmd.multiDraw.countsOffset || 0,
            type,
            cmd.multiDraw.offsets,
            cmd.multiDraw.offsetsOffset || 0,
            cmd.multiDraw.instanceCounts,
            cmd.multiDraw.instanceCountsOffset || 0,
            cmd.multiDraw.drawCount || cmd.multiDraw.counts.length,
          );
        }
      } else {
        // Multi draw elements instanced fallback
        // TODO: fallback
        console.error("Unsupported multidraw. No fallback.");
      }
    } else {
      // Non-multi drawing
      if (
        ctx.capabilities.drawInstancedBase &&
        (Number.isFinite(cmd.baseVertex) || Number.isFinite(cmd.baseInstance))
      ) {
        // Draw elements instanced base
        const ext = gl.getExtension(
          "WEBGL_draw_instanced_base_vertex_base_instance",
        );
        ext.drawElementsInstancedBaseVertexBaseInstanceWEBGL(
          primitive,
          count,
          type,
          offset,
          cmd.instances,
          cmd.baseVertex || 0,
          cmd.baseInstance || 0,
        );
      } else {
        // Draw elements instanced (or base fallback with offset from enableVertexData)
        gl.drawElementsInstanced(primitive, count, type, offset, cmd.instances);
      }
    }
  } else {
    // Non instanced drawing
    if (cmd.multiDraw) {
      if (ctx.capabilities.multiDraw) {
        // Multidraw elements
        const ext = gl.getExtension("WEBGL_multi_draw");
        ext.multiDrawElementsWEBGL(
          primitive,
          cmd.multiDraw.counts,
          cmd.multiDraw.countsOffset || 0,
          type,
          cmd.multiDraw.offsets,
          cmd.multiDraw.offsetsOffset || 0,
          cmd.multiDraw.drawCount || cmd.multiDraw.counts.length,
        );
      } else {
        // Multidraw elements fallback
        const countsOffset = cmd.multiDraw.countsOffset || 0;
        const offsetsOffset = cmd.multiDraw.offsetsOffset || 0;
        const drawCount =
          cmd.multiDraw.drawCount || cmd.multiDraw.counts.length;
        for (let i = 0; i < drawCount; i++) {
          gl.drawElements(
            primitive,
            cmd.multiDraw.counts[i + countsOffset],
            type,
            cmd.multiDraw.offsets[i + offsetsOffset],
          );
        }
      }
    } else {
      // Draw elements
      gl.drawElements(primitive, count, type, offset);
    }
  }
}
function drawArrays(ctx, cmd, instanced, primitive) {
  const gl = ctx.gl;

  if (instanced) {
    if (cmd.multiDraw && ctx.capabilities.multiDraw) {
      if (
        cmd.multiDraw.baseInstances &&
        ctx.capabilities.multiDrawInstancedBase
      ) {
        const ext = gl.getExtension(
          "WEBGL_multi_draw_instanced_base_vertex_base_instance",
        );

        ext.multiDrawArraysInstancedBaseInstanceWEBGL(
          primitive,
          cmd.multiDraw.firsts,
          cmd.multiDraw.firstsOffset || 0,
          cmd.multiDraw.counts,
          cmd.multiDraw.countsOffset || 0,
          cmd.multiDraw.instanceCounts,
          cmd.multiDraw.instanceCountsOffset || 0,
          cmd.multiDraw.baseInstances,
          cmd.multiDraw.baseInstancesOffset || 0,
          cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length,
        );
      } else {
        const ext = gl.getExtension("WEBGL_multi_draw");
        ext.multiDrawArraysInstancedWEBGL(
          primitive,
          cmd.multiDraw.firsts,
          cmd.multiDraw.firstsOffset || 0,
          cmd.multiDraw.counts,
          cmd.multiDraw.countsOffset || 0,
          cmd.multiDraw.instanceCounts,
          cmd.multiDraw.instanceCountsOffset || 0,
          cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length,
        );
      }
    } else {
      // Non-multi drawing
      if (
        ctx.capabilities.drawInstancedBase &&
        Number.isFinite(cmd.baseInstance)
      ) {
        // Draw arrays instanced with base instance
        const ext = gl.getExtension(
          "WEBGL_draw_instanced_base_vertex_base_instance",
        );
        ext.drawArraysInstancedBaseInstanceWEBGL(
          primitive,
          cmd.first || 0,
          cmd.count,
          cmd.instances,
          cmd.baseInstance,
        );
      } else {
        // Draw arrays instanced (or base instance fallback)
        gl.drawArraysInstanced(
          primitive,
          cmd.first || 0,
          cmd.count,
          cmd.instances,
        );
      }
    }
  } else {
    // Non instanced drawing
    if (cmd.multiDraw) {
      // Multidraw arrays
      if (ctx.capabilities.multiDraw) {
        const ext = gl.getExtension("WEBGL_multi_draw");
        ext.multiDrawArraysWEBGL(
          primitive,
          cmd.multiDraw.firsts,
          cmd.multiDraw.firstsOffset || 0,
          cmd.multiDraw.counts,
          cmd.multiDraw.countsOffset || 0,
          cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length,
        );
      } else {
        // Multidraw arrays fallback
        const firstsOffset = cmd.multiDraw.firstsOffset || 0;
        const countsOffset = cmd.multiDraw.countsOffset || 0;
        const drawCount =
          cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length;
        for (let i = 0; i < drawCount; i++) {
          gl.drawArrays(
            primitive,
            cmd.multiDraw.firsts[i + firstsOffset],
            cmd.multiDraw.counts[i + countsOffset],
          );
        }
      }
    } else {
      // Draw arrays
      gl.drawArrays(primitive, cmd.first || 0, cmd.count);
    }
  }
}
function draw(ctx, cmd) {
  const instanced = Object.values(
    cmd.attributes || cmd.vertexArray.attributes,
  ).some((attrib) => attrib.divisor);

  const primitive = cmd.pipeline.primitive;

  // Draw elements/arrays: instanced, base, multi-draw
  if (cmd.indices || cmd.vertexArray?.indices) {
    drawElements(ctx, cmd, instanced, primitive);
  } else if (cmd.count || cmd.multiDraw?.counts) {
    drawArrays(ctx, cmd, instanced, primitive);
  } else {
    throw new Error("Vertex arrays requires elements, count or multiDraw");
  }
}

export {
  NAMESPACE,
  isWebGL2,
  checkProps,
  compareFBOAttachments,
  enableVertexData,
  draw,
};
