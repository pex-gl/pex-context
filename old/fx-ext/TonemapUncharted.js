define([
  'pex/fx/FXStage',
  'pex/color/Color',
  'lib/text!fx/TonemapUncharted.glsl'
], function (FXStage, Color, TonemapUnchartedGLSL) {
  FXStage.prototype.tonemapUncharted = function (options) {
    options = options || {};
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();
    this.getSourceTexture().bind(0);
    var program = this.getShader(TonemapUnchartedGLSL);
    program.use();
    program.uniforms.tex0(0);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();
    return this.asFXStage(rt, 'tonemapUncharted');
  };
});