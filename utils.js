// Debug
const NAMESPACE = "pex-context";

const checkProps = (allowedProps, obj) =>
  Object.keys(obj).forEach((prop) => {
    if (!allowedProps.includes(prop)) throw new Error(`Unknown prop "${prop}"`);
  });

const isWebGL2 = (gl) =>
  typeof WebGL2RenderingContext !== "undefined" &&
  gl instanceof WebGL2RenderingContext;

const isObject = (obj) =>
  Object.prototype.toString.call(obj) === "[object Object]";

const is2DArray = (arr) => arr[0]?.length;

// State and gl
function compareFBOAttachments(framebuffer, passOpts) {
  const fboDepthAttachment = framebuffer.depth?.texture;
  const passDepthAttachment = passOpts.depth?.texture || passOpts.depth;
  if (fboDepthAttachment != passDepthAttachment) return false;
  if (framebuffer.color.length != passOpts.color?.length) return false;

  for (let i = 0; i < framebuffer.color.length; i++) {
    const fboColorAttachment = framebuffer.color[i]?.texture;
    const passColorAttachment = passOpts.color[i]?.texture || passOpts.color[i];
    if (fboColorAttachment != passColorAttachment) return false;
  }

  return true;
}

const getUniformLocation = (gl, program, name) =>
  gl.getUniformLocation(program.handle, name);

function enableVertexData(ctx, vertexLayout, cmd, updateState) {
  const gl = ctx.gl;

  const { attributes = {}, indices } = cmd;

  for (
    let i = vertexLayout.length;
    i < ctx.capabilities.maxVertexAttribs;
    i++
  ) {
    if (ctx.state.activeAttributes[i]) {
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.vertexAttribPointer(i, 4, ctx.DataType.Float32, false, 0, 0);
      gl.disableVertexAttribArray(i);
      ctx.state.activeAttributes[i] = null;
    }
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

      const type = attrib.type || buffer.type;
      const stride = attrib.stride || 64;
      const baseOffset =
        !ctx.capabilities.drawInstancedBase &&
        attrib.divisor &&
        cmd.baseInstance
          ? Math.floor(cmd.baseInstance / attrib.divisor) * stride
          : 0;
      // TODO: is this still valid?
      // we still check for buffer type because while e.g. pex-renderer would copy buffer type to attrib, a raw pex-context example probably would not
      gl.vertexAttribPointer(
        location,
        4,
        type,
        attrib.normalized || false,
        stride,
        (attrib.offset || 0) + baseOffset,
      );
      gl.vertexAttribPointer(
        location + 1,
        4,
        type,
        attrib.normalized || false,
        stride,
        (attrib.offset || 16) + baseOffset,
      );
      gl.vertexAttribPointer(
        location + 2,
        4,
        type,
        attrib.normalized || false,
        stride,
        (attrib.offset || 32) + baseOffset,
      );
      gl.vertexAttribPointer(
        location + 3,
        4,
        type,
        attrib.normalized || false,
        stride,
        (attrib.offset || 48) + baseOffset,
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

      // Base vertex/instance fallback
      if (
        !ctx.capabilities.drawInstancedBase &&
        (cmd.baseInstance || cmd.baseVertex)
      ) {
        const bytesPerElement = ctx.DataTypeConstructor[type].BYTES_PER_ELEMENT;
        if (attrib.divisor) {
          const stride = attrib.stride || size * bytesPerElement;
          offset += Math.floor(cmd.baseInstance / attrib.divisor) * stride;
        } else if (indices) {
          offset += (cmd.baseVertex || 0) * size * bytesPerElement;
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
          // Multidraw elements instanced (or multidraw base fallback)
          if (cmd.multiDraw.baseVertices || cmd.multiDraw.baseInstances) {
            const countsOffset = cmd.multiDraw.countsOffset || 0;
            const offsetsOffset = cmd.multiDraw.offsetsOffset || 0;
            const instanceCountsOffset =
              cmd.multiDraw.instanceCountsOffset || 0;
            const baseVerticesOffset = cmd.multiDraw.baseVerticesOffset || 0;
            const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
            const drawCount =
              cmd.multiDraw.drawCount || cmd.multiDraw.counts.length;
            const drawIDLoc =
              ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
            if (ctx.capabilities.drawInstancedBase) {
              const ext = gl.getExtension(
                "WEBGL_draw_instanced_base_vertex_base_instance",
              );
              for (let i = 0; i < drawCount; i++) {
                if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
                ext.drawElementsInstancedBaseVertexBaseInstanceWEBGL(
                  primitive,
                  cmd.multiDraw.counts[i + countsOffset],
                  type,
                  cmd.multiDraw.offsets[i + offsetsOffset],
                  cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
                  cmd.multiDraw.baseVertices?.[i + baseVerticesOffset] || 0,
                  cmd.multiDraw.baseInstances?.[i + baseInstancesOffset] || 0,
                );
              }
            } else {
              for (let i = 0; i < drawCount; i++) {
                if (cmd.attributes) {
                  enableVertexData(
                    ctx,
                    ctx.state.vertexLayout,
                    {
                      attributes: cmd.attributes,
                      indices: cmd.indices,
                      baseVertex:
                        cmd.multiDraw.baseVertices?.[i + baseVerticesOffset] ||
                        0,
                      baseInstance:
                        cmd.multiDraw.baseInstances?.[
                          i + baseInstancesOffset
                        ] || 0,
                    },
                    false,
                  );
                }
                if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
                gl.drawElementsInstanced(
                  primitive,
                  cmd.multiDraw.counts[i + countsOffset],
                  type,
                  cmd.multiDraw.offsets[i + offsetsOffset],
                  cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
                );
              }
            }
          } else {
            const ext = gl.getExtension("WEBGL_multi_draw");
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
        }
      } else {
        // Multi draw elements instanced fallback
        const countsOffset = cmd.multiDraw.countsOffset || 0;
        const offsetsOffset = cmd.multiDraw.offsetsOffset || 0;
        const instanceCountsOffset = cmd.multiDraw.instanceCountsOffset || 0;
        const drawCount =
          cmd.multiDraw.drawCount || cmd.multiDraw.counts.length;
        if (
          ctx.capabilities.drawInstancedBase &&
          (cmd.multiDraw.baseVertices || cmd.multiDraw.baseInstances)
        ) {
          const baseVerticesOffset = cmd.multiDraw.baseVerticesOffset || 0;
          const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
          const ext = gl.getExtension(
            "WEBGL_draw_instanced_base_vertex_base_instance",
          );
          const drawIDLoc =
            ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
          for (let i = 0; i < drawCount; i++) {
            if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
            ext.drawElementsInstancedBaseVertexBaseInstanceWEBGL(
              primitive,
              cmd.multiDraw.counts[i + countsOffset],
              type,
              cmd.multiDraw.offsets[i + offsetsOffset],
              cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
              cmd.multiDraw.baseVertices?.[i + baseVerticesOffset] || 0,
              cmd.multiDraw.baseInstances?.[i + baseInstancesOffset] || 0,
            );
          }
        } else {
          const baseVerticesOffset = cmd.multiDraw.baseVerticesOffset || 0;
          const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
          const drawIDLoc =
            ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
          for (let i = 0; i < drawCount; i++) {
            if (
              (cmd.multiDraw.baseVertices || cmd.multiDraw.baseInstances) &&
              cmd.attributes
            ) {
              enableVertexData(
                ctx,
                ctx.state.vertexLayout,
                {
                  attributes: cmd.attributes,
                  indices: cmd.indices,
                  baseVertex:
                    cmd.multiDraw.baseVertices?.[i + baseVerticesOffset] || 0,
                  baseInstance:
                    cmd.multiDraw.baseInstances?.[i + baseInstancesOffset] || 0,
                },
                false,
              );
            }
            if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
            gl.drawElementsInstanced(
              primitive,
              cmd.multiDraw.counts[i + countsOffset],
              type,
              cmd.multiDraw.offsets[i + offsetsOffset],
              cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
            );
          }
        }
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
        const drawIDLoc =
          ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
        for (let i = 0; i < drawCount; i++) {
          if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
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
    if (cmd.multiDraw) {
      if (ctx.capabilities.multiDraw) {
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
          // Multidraw arrays instanced (or multidraw base fallback)
          if (cmd.multiDraw.baseInstances) {
            const firstsOffset = cmd.multiDraw.firstsOffset || 0;
            const countsOffset = cmd.multiDraw.countsOffset || 0;
            const instanceCountsOffset =
              cmd.multiDraw.instanceCountsOffset || 0;
            const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
            const drawCount =
              cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length;
            const drawIDLoc =
              ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
            if (ctx.capabilities.drawInstancedBase) {
              const ext = gl.getExtension(
                "WEBGL_draw_instanced_base_vertex_base_instance",
              );
              for (let i = 0; i < drawCount; i++) {
                if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
                ext.drawArraysInstancedBaseInstanceWEBGL(
                  primitive,
                  cmd.multiDraw.firsts[i + firstsOffset],
                  cmd.multiDraw.counts[i + countsOffset],
                  cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
                  cmd.multiDraw.baseInstances[i + baseInstancesOffset],
                );
              }
            } else {
              for (let i = 0; i < drawCount; i++) {
                const baseInstance =
                  cmd.multiDraw.baseInstances[i + baseInstancesOffset];
                if (baseInstance && cmd.attributes) {
                  enableVertexData(
                    ctx,
                    ctx.state.vertexLayout,
                    { attributes: cmd.attributes, baseInstance },
                    false,
                  );
                }
                if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
                gl.drawArraysInstanced(
                  primitive,
                  cmd.multiDraw.firsts[i + firstsOffset],
                  cmd.multiDraw.counts[i + countsOffset],
                  cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
                );
              }
            }
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
        }
      } else {
        // Multidraw arrays instanced fallback
        const firstsOffset = cmd.multiDraw.firstsOffset || 0;
        const countsOffset = cmd.multiDraw.countsOffset || 0;
        const instanceCountsOffset = cmd.multiDraw.instanceCountsOffset || 0;
        const drawCount =
          cmd.multiDraw.drawCount || cmd.multiDraw.firsts.length;
        const drawIDLoc =
          ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
        if (ctx.capabilities.drawInstancedBase && cmd.multiDraw.baseInstances) {
          const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
          const ext = gl.getExtension(
            "WEBGL_draw_instanced_base_vertex_base_instance",
          );
          for (let i = 0; i < drawCount; i++) {
            if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
            ext.drawArraysInstancedBaseInstanceWEBGL(
              primitive,
              cmd.multiDraw.firsts[i + firstsOffset],
              cmd.multiDraw.counts[i + countsOffset],
              cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
              cmd.multiDraw.baseInstances[i + baseInstancesOffset],
            );
          }
        } else {
          const baseInstancesOffset = cmd.multiDraw.baseInstancesOffset || 0;
          for (let i = 0; i < drawCount; i++) {
            const baseInstance =
              cmd.multiDraw.baseInstances?.[i + baseInstancesOffset] || 0;
            if (baseInstance && cmd.attributes) {
              enableVertexData(
                ctx,
                ctx.state.vertexLayout,
                { attributes: cmd.attributes, baseInstance },
                false,
              );
            }
            if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
            gl.drawArraysInstanced(
              primitive,
              cmd.multiDraw.firsts[i + firstsOffset],
              cmd.multiDraw.counts[i + countsOffset],
              cmd.multiDraw.instanceCounts[i + instanceCountsOffset],
            );
          }
        }
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
        const drawIDLoc =
          ctx.state.program?.uniforms["uDrawID"]?.location ?? null;
        for (let i = 0; i < drawCount; i++) {
          if (drawIDLoc !== null) gl.uniform1i(drawIDLoc, i);
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
  isObject,
  is2DArray,
  checkProps,
  compareFBOAttachments,
  getUniformLocation,
  enableVertexData,
  draw,
};
