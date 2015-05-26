var fx = require('pex-fx');
var FXStage = fx.FXStage;
var fs = require('fs');

var ContrastGLSL = fs.readFileSync(__dirname + '/Contrast.glsl', 'utf8');

FXStage.prototype.contrast = function (options) {
  options = options || { contrast: 1 };
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  var program = this.getShader(ContrastGLSL);
  program.use();
  program.uniforms.tex0(0);
  program.uniforms.contrast(options.contrast);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'contrast');
};

module.exports = FXStage;