define(["fx/FXGraph", "text!fx/Threshold.glsl"], function(FXGraph, ThresholdGLSL) {
  FXGraph.prototype.threshold = function(options) {
    options = options || {};
    threshold = (options.threshold !== undefined) ? options.threshold : 0.5;

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);    
    rt.bind();

    this.getSourceTexture().bind();
    var program = this.getShader(ThresholdGLSL);
    program.use();
    program.uniforms.threshold( threshold );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, program);

    rt.unbind();

    this.stack.push(rt);

    rt.name = "threshold";
    return this;
  }
})