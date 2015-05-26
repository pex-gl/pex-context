var fx = require('pex-fx');
var FXStage = fx.FXStage;
var geom = require('pex-geom')
var Vec2 = geom.Vec2;
var fs = require('fs');

var SSAOGLSL = fs.readFileSync(__dirname + '/SSAO.glsl', 'utf8');

FXStage.prototype.ssao = function (options) {
  options = options || {};
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  var depthMap = this.getSourceTexture(options.depthMap);
  depthMap.bind(0);
  var program = this.getShader(SSAOGLSL);
  program.use();
  program.uniforms.textureSize(Vec2.create(depthMap.width, depthMap.height));
  program.uniforms.depthMap(0);
  program.uniforms.near(options.camera.getNear());
  program.uniforms.far(options.camera.getFar());
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'ssao');
};

module.exports = FXStage;