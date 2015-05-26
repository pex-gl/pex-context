define([
  'pex/fx/FXStage',
  'pex/color/Color',
  'lib/text!fx/TonemapRichard.glsl'
], function (FXStage, Color, TonemapRichardGLSL) {
  FXStage.prototype.tonemapRichard = function (options) {
    options = options || {
      exposure: 1
    };
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();
    this.getSourceTexture().bind(0);
    var program = this.getShader(TonemapRichardGLSL);
    program.use();
    program.uniforms.tex0(0);
    program.uniforms.exposure(options.exposure);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();
    return this.asFXStage(rt, 'tonemapRichard');
  };
});