var Context = require('./Context');

function Material(program, uniforms) {
  this.gl = Context.currentContext;
  this.program = program;
  this.uniforms = uniforms || {};
}

Material.prototype.use = function () {
  this.program.use();
  var numTextures = 0;
  for (var name in this.program.uniforms) {
    if (this.program.uniforms[name].type == this.gl.SAMPLER_2D || this.program.uniforms[name].type == this.gl.SAMPLER_CUBE) {
      this.gl.activeTexture(this.gl.TEXTURE0 + numTextures);
      //bind only loaded / initialized textures
      if (this.uniforms[name] && this.uniforms[name].width > 0 && this.uniforms[name].height > 0) {
        this.gl.bindTexture(this.uniforms[name].target, this.uniforms[name].handle);
        this.program.uniforms[name](numTextures);
      }
      numTextures++;
    }
    else if (this.uniforms[name] !== undefined) {
      this.program.uniforms[name](this.uniforms[name]);
    }
  }
};

module.exports = Material;
