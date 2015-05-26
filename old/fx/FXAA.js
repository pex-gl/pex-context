var geom  = require('pex-geom');
var FXStage = require('./FXStage');
var fs = require('fs');

var FXAAGLSL = fs.readFileSync(__dirname + '/FXAA.glsl', 'utf8');

FXStage.prototype.fxaa = function (options) {
  options = options || {};
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  var source = this.getSourceTexture();
  source.bind();
  var program = this.getShader(FXAAGLSL);
  program.use();
  program.uniforms.rtWidth(source.width);
  program.uniforms.rtHeight(source.height);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'fxaa');
};

module.exports = FXStage;