var fx = require('pex-fx');
var FXStage = fx.FXStage;
var geom = require('pex-geom')
var Vec2 = geom.Vec2;
var fs = require('fs');
var merge = require('merge');

var ShadowMapGLSL = fs.readFileSync(__dirname + '/ShadowMap.glsl', 'utf8');

FXStage.prototype.shadowMap = function (options) {
  var defaultOptions = { bias: 0.01 };
  options = merge(defaultOptions, options);
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  var depthMap = this.getSourceTexture(options.depthMap);
  depthMap.bind(1);
  var lightDepthMap = this.getSourceTexture(options.lightDepthMap);
  lightDepthMap.bind(2);
  var normalMap = this.getSourceTexture(options.normalMap);
  normalMap.bind(3);
  var program = this.getShader(ShadowMapGLSL);
  program.use();
  program.uniforms.colorMap(0);
  program.uniforms.depthMap(1);
  program.uniforms.lightDepthMap(2);
  program.uniforms.normalMap(3);
  if (program.uniforms.camNear) program.uniforms.camNear(options.camera.getNear());
  if (program.uniforms.camFar) program.uniforms.camFar(options.camera.getFar());
  if (program.uniforms.camAspectRatio) program.uniforms.camAspectRatio(options.camera.getAspectRatio());
  if (program.uniforms.camFov) program.uniforms.camFov(options.camera.getFov());
  if (program.uniforms.camViewMatrix) program.uniforms.camViewMatrix(options.camera.getViewMatrix());
  if (program.uniforms.camInvViewMatrix) program.uniforms.camInvViewMatrix(options.camera.getViewMatrix().dup().invert());
  if (program.uniforms.camProjectionMatrix) program.uniforms.camProjectionMatrix(options.camera.getProjectionMatrix());
  if (program.uniforms.lightNear) program.uniforms.lightNear(options.lightCamera.getNear());
  if (program.uniforms.lightFar) program.uniforms.lightFar(options.lightCamera.getFar());
  if (program.uniforms.lightAspectRatio) program.uniforms.lightAspectRatio(options.lightCamera.getAspectRatio());
  if (program.uniforms.lightFov) program.uniforms.lightFov(options.lightCamera.getFov());
  if (program.uniforms.lightViewMatrix) program.uniforms.lightViewMatrix(options.lightCamera.getViewMatrix());
  if (program.uniforms.lightProjectionMatrix) program.uniforms.lightProjectionMatrix(options.lightCamera.getProjectionMatrix());
  if (program.uniforms.lightPos) program.uniforms.lightPos(options.lightCamera.getPosition());
  if (program.uniforms.bias) program.uniforms.bias(options.bias);
  //program.uniforms.strength(options.strength === null ? 1 : options.strength);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'shadowMap');
};

module.exports = FXStage;