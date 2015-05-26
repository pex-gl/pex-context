define(['pex/fx/FXStage', 'lib/text!fx/RGBShift.glsl', 'pex/geom/Vec2'], function(FXStage, RGBShiftGLSL, Vec2) {
  FXStage.prototype.rgbShift = function(options) {
    options = options || {};
    r = (options.r !== undefined) ? options.r : new Vec2(0.0);
    g = (options.g !== undefined) ? options.g : new Vec2(0.0);
    b = (options.b !== undefined) ? options.b : new Vec2(0.0);

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();

    this.getSourceTexture().bind();
    var program = this.getShader(RGBShiftGLSL);
    program.use();
    program.uniforms.r( r );
    program.uniforms.g( g );
    program.uniforms.b( b );
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();

    return this.asFXStage(rt, 'rgbShift');
  }
})