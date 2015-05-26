define(['pex/fx/FXStage', 'lib/text!fx/ThresholdBW.glsl'], function(FXStage, ThresholdBWGLSL) {
  FXStage.prototype.thresholdBW = function(options) {
    options = options || {};
    threshold = (options.threshold !== undefined) ? options.threshold : 0.5;

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();

    this.getSourceTexture().bind();
    var program = this.getShader(ThresholdBWGLSL);
    program.use();
    program.uniforms.threshold( threshold );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'thresholdBW');
  }
})