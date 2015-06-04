//clears the frame buffer

function ClearCommand(opts) {
  opts = opts || {}; //TODO: setup defaults
  this.color = opts.color;
  this.depth = opts.depth;
  this.framebuffer = opts.framebuffer;
}

ClearCommand.prototype.execute = function(context) {
  context.clear(this);
}

module.exports = ClearCommand;
