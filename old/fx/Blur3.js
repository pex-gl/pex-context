var geom  = require('pex-geom');
var Vec2 = geom.Vec2;
var FXStage = require('./FXStage');
var fs = require('fs');

var Blur3HGLSL = fs.readFileSync(__dirname + '/Blur3H.glsl', 'utf8');
var Blur3VGLSL = fs.readFileSync(__dirname + '/Blur3V.glsl', 'utf8');

FXStage.prototype.blur3 = function (options) {
  options = options || {};
  var outputSize = this.getOutputSize(options.width, options.height);
  var rth = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  var rtv = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  var source = this.getSourceTexture();
  var programH = this.getShader(Blur3HGLSL);
  programH.use();
  programH.uniforms.imageSize(Vec2.create(source.width, source.height));
  rth.bindAndClear();
  this.drawFullScreenQuad(outputSize.width, outputSize.height, source, programH);
  rth.unbind();
  var programV = this.getShader(Blur3VGLSL);
  programV.use();
  programV.uniforms.imageSize(Vec2.create(source.width, source.height));
  rtv.bindAndClear();
  this.drawFullScreenQuad(outputSize.width, outputSize.height, rth.getColorAttachment(0), programV);
  rtv.unbind();
  return this.asFXStage(rtv, 'blur3');
};

module.exports = FXStage;