//encapsulates all the state, geometry and program for a single draw call

function DrawCommand(opts) {
  opts = opts || {}; //TODO: setup defaults
  this.program = opts.program;
  this.vertexArray = opts.vertexArray;
  this.renderState = opts.renderState;
  this.uniforms = opts.uniforms;
  this.framebuffer = opts.framebuffer;
  this.tmp = opts.tmp;
}

DrawCommand.prototype.execute = function(context) {
  context.draw(this);
}

module.exports = DrawCommand;
