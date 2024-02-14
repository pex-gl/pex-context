export default function polyfill(ctx) {
  const { gl, capabilities } = ctx;

  if (!gl.HALF_FLOAT) {
    const ext = gl.getExtension("OES_texture_half_float");
    if (ext) gl.HALF_FLOAT = ext.HALF_FLOAT_OES;
  }

  if (!gl.createVertexArray) {
    const ext = gl.getExtension("OES_vertex_array_object");
    gl.createVertexArray = ext.createVertexArrayOES.bind(ext);
    gl.bindVertexArray = ext.bindVertexArrayOES.bind(ext);
  }

  if (!gl.drawElementsInstanced) {
    const ext = gl.getExtension("ANGLE_instanced_arrays");
    gl.drawElementsInstanced = ext.drawElementsInstancedANGLE.bind(ext);
    gl.drawArraysInstanced = ext.drawArraysInstancedANGLE.bind(ext);
    gl.vertexAttribDivisor = ext.vertexAttribDivisorANGLE.bind(ext);
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

  if (!capabilities.isWebGL2) {
    gl.getExtension("OES_element_index_uint");
    gl.getExtension("OES_standard_derivatives");

    const extsRGB = gl.getExtension("EXT_sRGB");
    if (extsRGB) {
      gl.SRGB ||= extsRGB.SRGB_EXT;
      gl.SRGB8 ||= extsRGB.SRGB_ALPHA_EXT;
      gl.SRGB8_ALPHA8 ||= extsRGB.SRGB8_ALPHA8_EXT;
    }
  }
}
