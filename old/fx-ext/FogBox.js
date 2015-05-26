var fx = require('pex-fx');
var FXStage = fx.FXStage;
var geom = require('pex-geom')
var Vec2 = geom.Vec2;
var fs = require('fs');

var FogBoxGLSL = fs.readFileSync(__dirname + '/FogBox.glsl', 'utf8');

FXStage.prototype.fogBox = function (options) {
  options = options || { };
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  var depthMap = this.getSourceTexture(options.depthMap);
  depthMap.bind(1);
  var program = this.getShader(FogBoxGLSL);
  program.use();
  program.uniforms.colorMap(0);
  program.uniforms.depthMap(1);
  if (program.uniforms.near) program.uniforms.near(options.camera.getNear());
  if (program.uniforms.far) program.uniforms.far(options.camera.getFar());
  if (program.uniforms.aspectRatio) program.uniforms.aspectRatio(options.camera.getAspectRatio());
  if (program.uniforms.fov) program.uniforms.fov(options.camera.getFov());
  //program.uniforms.strength(options.strength === null ? 1 : options.strength);
  if (program.uniforms.fogColor) program.uniforms.fogColor(options.color);
  if (program.uniforms.fogDensity) program.uniforms.fogDensity(options.fogDensity);
  if (program.uniforms.fogStart) program.uniforms.fogStart(options.fogStart);
  if (program.uniforms.fogEnd) program.uniforms.fogEnd(options.fogEnd);
  if (program.uniforms.fogBoundingBoxMin) program.uniforms.fogBoundingBoxMin(options.fogBoundingBox.min);
  if (program.uniforms.fogBoundingBoxMax) program.uniforms.fogBoundingBoxMax(options.fogBoundingBox.max);
  if (program.uniforms.invViewMatrix) program.uniforms.invViewMatrix(options.camera.getViewMatrix().dup().invert());
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'fogBox');
};

module.exports = FXStage;