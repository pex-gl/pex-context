//Adds another texture to current fx stage  

//## Example use
//     var fx = require('pex-fx');
//
//     var color = fx().render({ drawFunc: this.draw.bind(this) });
//     var glow = color.downsample().blur3().blur3();
//     var final = color.add(glow, { scale: 2 });
//     final.blit();
//

//## Reference

//Dependencies
var FXStage = require('./FXStage');
var fs = require('fs');

var AddGLSL = fs.readFileSync(__dirname + '/Add.glsl', 'utf8');

//### Add(source2, options)  
//Adds another texture to current fx stage  
//`source2` - a texture source to add *{ Texture2D or RenderTarget or FXStage }*  
//`options` - available options:  
// - `scale` - amount of source2 texture to add  *{ Number 0..1 }*  

FXStage.prototype.add = function (source2, options) {
  options = options || {};
  scale = options.scale !== undefined ? options.scale : 1;
  var outputSize = this.getOutputSize(options.width, options.height);
  var rt = this.getRenderTarget(outputSize.width, outputSize.height, options.depth, options.bpp);
  rt.bind();
  this.getSourceTexture().bind(0);
  this.getSourceTexture(source2).bind(1);
  var program = this.getShader(AddGLSL);
  program.use();
  program.uniforms.tex0(0);
  program.uniforms.tex1(1);
  program.uniforms.scale(scale);
  this.drawFullScreenQuad(outputSize.width, outputSize.height, null, program);
  rt.unbind();
  return this.asFXStage(rt, 'add');
};

module.exports = FXStage;