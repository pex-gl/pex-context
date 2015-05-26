var Context = require('./Context');

function Texture(target) {
  if (target) {
    this.init(target);
  }
}

Texture.RGBA32F = 34836;

Texture.prototype.init = function(target) {
  this.gl = Context.currentContext;
  this.target = target;
  this.handle = this.gl.createTexture();
};

//### bind ( unit )
//Binds the texture to the current GL context.
//`unit` - texture unit in which to place the texture *{ Number/Int }* = 0

Texture.prototype.bind = function(unit) {
  unit = unit ? unit : 0;
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.target, this.handle);
};

module.exports = Texture;