//clears the frame buffer

function ClearCommand(opts) {
  opts = opts || {}; //TODO: setup defaults
  this.color = opts.color;
  this.depth = opts.depth;
}

ClearCommand.prototype.execute = function(context) {
  context.clear(this);
}

module.exports = ClearCommand;