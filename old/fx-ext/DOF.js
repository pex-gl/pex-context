var FXStage = require('pex-fx').FXStage;
var fs = require('fs');

var DOFGLSL = fs.readFileSync(__dirname + '/DOF.glsl', 'utf8');

FXStage.prototype.dof = function (source2, options) {
  options = options || {};
  scale = options.scale !== undefined ? options.scale : 1;
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  this.getSourceTexture(source2).bind(1);
  this.getSourceTexture(options.depthMap).bind(2);
  var program = this.getShader(DOFGLSL);
  program.use();
  program.uniforms.color(0);
  program.uniforms.blurred(1);
  program.uniforms.depthMap(2);
  program.uniforms.near(options.camera.getNear());
  program.uniforms.far(options.camera.getFar());
  program.uniforms.fov(options.camera.getFov());
  program.uniforms.aspectRatio(options.camera.getAspectRatio());
  program.uniforms.focusDepth(options.focusDepth);
  program.uniforms.focusRange(options.focusRange);
  program.uniforms.invViewMatrix(options.camera.getViewMatrix().dup().invert());
  program.uniforms.scale(scale);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'dof');
};

module.exports = FXStage;