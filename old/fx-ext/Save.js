define([
  'pex/fx/FXStage',
  'pex/color/Color',
  'lib/text!fx/Save.glsl'
], function (FXStage, Color, SaveGLSL) {
  var pad = function(num, char, len) {
    var s = '' + num;
    while (s.length < len) {
      s = char + s;
    }
    return s;
  }

  FXStage.prototype.save = function (path, options) {
    path = path || '.'
    options = options || {};

    var outputSize = this.getOutputSize(options.width, options.height);
    var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
    rt.bind();
    this.getSourceTexture().bind(0);
    var program = this.getShader(SaveGLSL);
    program.use();
    program.uniforms.tex0(0);
    this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);

    var oldViewport = this.gl.getParameter(this.gl.VIEWPORT);
    this.gl.viewport(0, 0, outputSize.width, outputSize.height);

    var d = new Date();
    var filename = path + "/screenshot_"
    filename += d.getFullYear() + '-' + pad(d.getMonth()+1,'0',2) + '-' + pad(d.getDate(),'0',2);
    filename += '_' + pad(d.getHours(),'0',2) + ':' + pad(d.getMinutes(),'0',2) + ':' + pad(d.getSeconds(),'0',2) + '.png'
    this.gl.writeImage('png', filename);
    console.log('Saved', filename);

    this.gl.viewport(oldViewport[0], oldViewport[1], oldViewport[2], oldViewport[3]);

    rt.unbind();

    return this.asFXStage(rt, 'save');
  };
});