var geom  = require('pex-geom');
var Vec2 = geom.Vec2;
var FXStage = require('./FXStage');
var fs = require('fs');

var Downsample2GLSL = fs.readFileSync(__dirname + '/Downsample2.glsl', 'utf8');

FXStage.prototype.downsample2 = function (options) {
  options = options || {};
  var outputSize = this.getOutputSize(options.width, options.height);
  outputSize.width /= 2;
  outputSize.height /= 2;
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  var source = this.getSourceTexture();
  var program = this.getShader(Downsample2GLSL);
  program.use();
  program.uniforms.imageSize(Vec2.create(source.width, source.height));
  rt.bindAndClear();
  this.drawFullScreenQuad(outputSize.width, outputSize.height, source, program);
  rt.unbind();
  return this.asFXStage(rt, 'downsample2');
};

module.exports = FXStage;