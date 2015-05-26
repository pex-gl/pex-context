var fx = require('pex-fx');
var FXStage = fx.FXStage;
var geom = require('pex-geom')
var Vec2 = geom.Vec2;
var fs = require('fs');

var FogGLSL = fs.readFileSync(__dirname + '/Fog.glsl', 'utf8');

FXStage.prototype.fog = function (options) {
  options = options || { };
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  var depthMap = this.getSourceTexture(options.depthMap);
  depthMap.bind(1);
  var program = this.getShader(FogGLSL);
  program.use();
  program.uniforms.colorMap(0);
  program.uniforms.depthMap(1);
  if (program.uniforms.near) program.uniforms.near(options.camera.getNear());
  if (program.uniforms.far) program.uniforms.far(options.camera.getFar());
  if (program.uniforms.aspectRatio) program.uniforms.aspectRatio(options.camera.getAspectRatio());
  if (program.uniforms.fov) program.uniforms.fov(options.camera.getFov());
  //program.uniforms.strength(options.strength === null ? 1 : options.strength);
  program.uniforms.fogColor(options.color);
  program.uniforms.fogDensity(options.fogDensity);
  program.uniforms.fogStart(options.fogStart);
  program.uniforms.fogEnd(options.fogEnd);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'fog');
};

module.exports = FXStage;