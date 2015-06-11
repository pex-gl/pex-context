var Texture2D = require('./Texture2D');
var TextureCube = require('./TextureCube');

function Context(gl) {
  this.gl = gl;
  this.defaults = {
    viewport: gl.getParameter(gl.VIEWPORT)
  }
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
  this.submit(cmd);
  this.render();
}

Context.prototype.submit = function(cmd) {
  this.commands.push(cmd);
}

Context.prototype.render = function() {
  var gl = this.gl;
  var prevCmd;

  for(var i=0; i<this.commands.length; i++) {
    var cmd = this.commands[i];

    //FIXME: store default viewport
    //FIXME: compare with previous viewport
    if (cmd.viewport) {
      gl.viewport(cmd.viewport[0], cmd.viewport[1], cmd.viewport[2], cmd.viewport[3]);
    }

    //if !a && !b -> nothing
    //if a && !b -> a
    //if a && b && a == b -> nothing
    //if a && b && a != b -> a
    //if !a && b -> undo b / default (a)

    //FIXME: can we generalize it somehow?
    if (cmd.framebuffer) {
      if (prevCmd) {
        if (prevCmd.framebuffer != cmd.framebuffer) {
          cmd.framebuffer.bind();
        }
        else {
          //keep the same framebuffer bound
        }
      }
      else {
        cmd.framebuffer.bind();
      }
    }
    else if (prevCmd && prevCmd.framebuffer) {
      //FIXME: framebuffer automagic, keeping ref to previousily bound fbo
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      //prevCmd.framebuffer.unbind();
    }
    else {
      //nothing to do
    }

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
            numTextures++;
            //FIXME: unbind when we are done
          }
          else if (cmd.uniforms[uniformName] instanceof TextureCube) {
            cmd.uniforms[uniformName].bind(numTextures);
            cmd.program.uniforms[uniformName](numTextures);
            numTextures++;
            //FIXME: unbind when we are done
          }
          else {
            //console.log('setting', uniformName, cmd.uniforms[uniformName])
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
        if (cmd.renderState.depthTest) {
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

    if (cmd.viewport) {
      //FIXME: this should go from some kind of stack?
      //gl.viewport(this.defaults.viewport[0], this.defaults.viewport[1], this.defaults.viewport[2], this.defaults.viewport[3]);
    }
    prevCmd = cmd;
  }


  if (prevCmd) {
    //FIXME: do this only if prev vertexArray is different
    if (prevCmd.vertexArray) {
      prevCmd.vertexArray.unbind(prevCmd.program);
    }

    //FIXME: do this only if prev program is different
    if (prevCmd.program) {
      prevCmd.program.unbind();
    }
  }

  //console.log('render', gl.getError())

  this.commands = [];
}

module.exports = Context;
