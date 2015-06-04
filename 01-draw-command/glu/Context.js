var Texture2D = require('./Texture2D');

function Context(gl) {
  this.gl = gl;
  this.commands = [];
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
  if (cmd.uniforms) {
    for(var uniformName in cmd.uniforms) {
      cmd.program.uniforms[uniformName](cmd.uniforms[uniformName]);
    }
  }
  cmd.vertexArray.bind(cmd.program);
  cmd.vertexArray.draw();
  cmd.vertexArray.unbind(cmd.program);
  cmd.program.unbind();
}

Context.prototype.submit = function(cmd) {
  this.commands.push(cmd);
}

Context.prototype.render = function() {
  var gl = this.gl;
  var prevCmd;
  for(var i=0; i<this.commands.length; i++) {
    var cmd = this.commands[i];

    if (!prevCmd || prevCmd.program != cmd.program) {
      if (cmd.program) {
        cmd.program.bind();
      }
    }

    //FIXME: counting texture uniforms to autoassign texture units
    var numTextures = 0;
    if (cmd.program && cmd.uniforms) {
      for(var uniformName in cmd.uniforms) {
        if (cmd.program.uniforms[uniformName]) {
          if (cmd.uniforms[uniformName] instanceof Texture2D) {
            cmd.uniforms[uniformName].bind(numTextures);
            cmd.program.uniforms[uniformName](numTextures);
            //FIXME: unbind when we are done
          }
          else {
            cmd.program.uniforms[uniformName](cmd.uniforms[uniformName]);
          }
        }
      }
    }

    if (cmd.vertexArray) {
      var shouldUnbind = false;
      var shouldBind = false;
      if (prevCmd) {
        if (prevCmd.vertexArray) {
          if (prevCmd.vertexArray != cmd.vertexArray) {
            shouldUnbind = true;
            shouldBind = true;
          }
        }
        else {
          shouldBind = true;
        }
      }
      else {
        shouldBind = true;
      }

      if (shouldUnbind) {
        prevCmd.vertexArray.unbind(prevCmd.program);
      }
      if (shouldBind) {
        cmd.vertexArray.bind(cmd.program);
      }
    }

    if (cmd.renderState) {
      if (!prevCmd || !prevCmd.renderState || prevCmd.renderState.depthTest != cmd.renderState.depthTest) {
        if (cmd.renderState.depthTest.enabled) {
          gl.enable(gl.DEPTH_TEST);
        }
        else {
          gl.disable(gl.DEPTH_TEST);
        }
      }
    }

    if (cmd.vertexArray) {
      cmd.vertexArray.draw();
    }
    else {
      //clear command
      cmd.execute(this);
    }

    prevCmd = cmd;
  }


  if (prevCmd) {
    if (prevCmd.vertexArray) {
      prevCmd.vertexArray.unbind(prevCmd.program);
    }

    if (prevCmd.program) {
      prevCmd.program.unbind();
    }
  }

  this.commands = [];
}

module.exports = Context;
