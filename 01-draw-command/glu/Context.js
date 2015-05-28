function Context(gl) {
  this.gl = gl;
}

Context.prototype.clear = function(cmd) {
  var gl = this.gl;
  var flags = 0;

  if (cmd.color !== undefined) {
    gl.clearColor(cmd.color[0], cmd.color[1], cmd.color[2], cmd.color[3]);
    flags |= gl.COLOR_BUFFER_BIT;
  }

  if (cmd.depth !== undefined) {
    flags |= gl.DEPTH_BUFFER_BIT;
  }

  if (flags) {
    gl.clear(flags);
  }
}

Context.prototype.draw = function(cmd) {
  var gl = this.gl;
  if (cmd.renderState.depthTest.enabled) {
    gl.enable(gl.DEPTH_TEST);
  }
  else {
    gl.disable(gl.DEPTH_TEST);
  }
  cmd.program.bind();
  cmd.vertexArray.bind(cmd.program);
  cmd.vertexArray.draw();
  cmd.vertexArray.unbind(cmd.program);
  cmd.program.unbind();
}

module.exports = Context;