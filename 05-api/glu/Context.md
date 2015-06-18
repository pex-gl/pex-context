https://www.khronos.org/files/webgl/webgl-reference-card-1_0.pdf

0: DEPTH_BIT: depthTest, depthMask, depthFunc, depthClearValue, depthRange, polygonOffset
1: COLOR_BIT: clearColor, colorMask
2: STENCIL_BIT: stencilTest, stencilFunc, stencilOp?, stencilClearValue?
3: VIEWPORT_BIT: viewport
4: SCISSOR_BIT: scissorRect, scissorTest?
5: CULL_BIT: cullMode, cullEnabled?, frontFace
6: BLEND_BIT: blendFunc, blendFuncSeparate, blendEnabled
7: ALPHA_BIT: SAMPLE_ALPHA_TO_COVERAGE, SAMPLE_COVERAGE
8: LINE_WIDTH_BIT: lineWidth

16: PROJECTION_MATRIX_BIT
17: VIEW_MATRIX_BIT
18: MODEL_MATRIX_BIT
19: FBO_BIT:
20: VBO_BIT: vbo
21: PROGRAM_BIT: program
22: TEXTURE_BIT: textureUnit[0..16] -> [text1, text2, null, null, null, null, null, ...]

23: XBO?
