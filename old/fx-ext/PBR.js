var FXStage = require('pex-fx').FXStage;
var fs = require('fs');

var PBRGLSL = fs.readFileSync(__dirname + '/PBR.glsl', 'utf8');

FXStage.prototype.pbr = function (options) {
  options = options || {};
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture(options.normalMap).bind(0);
  this.getSourceTexture(options.depthMap).bind(1);
  this.getSourceTexture(options.albedoMap).bind(2);
  this.getSourceTexture(options.occlusionMap).bind(3);
  this.getSourceTexture(options.reflectionMap).bind(4);
  this.getSourceTexture(options.specularMap).bind(5);
  var program = this.getShader(PBRGLSL);
  program.use();
  program.uniforms.normalMap(0);
  program.uniforms.depthMap(1);
  program.uniforms.albedoMap(2);
  program.uniforms.occlusionMap(3);
  if (program.uniforms.reflectionMap) program.uniforms.reflectionMap(4);
  if (program.uniforms.specularMap) program.uniforms.specularMap(5);
  if (program.uniforms.near) program.uniforms.near(options.camera.getNear());
  if (program.uniforms.far) program.uniforms.far(options.camera.getFar());
  if (program.uniforms.fov) program.uniforms.fov(options.camera.getFov());
  if (program.uniforms.aspectRatio) program.uniforms.aspectRatio(options.camera.getAspectRatio());
  program.uniforms.viewMatrix(options.camera.getViewMatrix());
  if (program.uniforms.invViewMatrix) program.uniforms.invViewMatrix(options.camera.getViewMatrix().dup().invert());
  if (program.uniforms.invProjectionMatrix) program.uniforms.invProjectionMatrix(options.camera.getProjectionMatrix().dup().invert());
  program.uniforms.lightPos(options.lightPos);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'pbr');
};

module.exports = FXStage;