define([
  'pex/fx/FXStage',
  'pex/color/Color',
  'lib/text!fx/Fog.glsl'
], function (FXStage, Color, FogGLSL) {
  FXStage.prototype.fog = function (source2, options) {
    options = options || {};
    var fogColor = options.fogColor || Color.White;
    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();
    this.getSourceTexture().bind(0);
    this.getSourceTexture(source2).bind(1);
    var program = this.getShader(FogGLSL);
    program.use();
    program.uniforms.tex0(0);
    program.uniforms.tex1(1);
    program.uniforms.fogColor(fogColor);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
    rt.unbind();
    return this.asFXStage(rt, 'fog');
  };
});