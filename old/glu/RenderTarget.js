var Context = require('./Context');
var Texture2D = require('./Texture2D');
var merge = require('merge');
var sys = require('pex-sys');
var Platform = sys.Platform;

function RenderTarget(width, height, options) {
  var gl = this.gl = Context.currentContext;

  var defaultOptions = {
    color: true,
    depth: false
  };
  options = merge(defaultOptions, options);

  this.width = width;
  this.height = height;

  //save current state to recover after we are done
  this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

  this.handle = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);

  this.colorAttachments = [];
  this.colorAttachmentsPositions = [];
  this.depthAttachments = [];

  //color buffer

  if (options.color === true) { //make our own
    var texture = Texture2D.create(width, height, options);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.target, texture.handle, 0);
    this.colorAttachments.push(texture);
    this.colorAttachmentsPositions.push(gl.COLOR_ATTACHMENT0);
  }
  else if (options.color.length !== undefined && options.color.length > 0) { //use supplied textures for MRT
    options.color.forEach(function(colorBuf, colorBufIndex) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + colorBufIndex, colorBuf.target, colorBuf.handle, 0);
      this.colorAttachments.push(colorBuf);
      this.colorAttachmentsPositions.push(gl.COLOR_ATTACHMENT0 + colorBufIndex);
    }.bind(this));
  }
  else if (options.color !== false) { //use supplied texture
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, options.color.target, options.color.handle, 0);
    this.colorAttachments.push(options.color);
    this.colorAttachmentsPositions.push(gl.COLOR_ATTACHMENT0);
  }

  //depth buffer

  if (options.depth) {
    if (options.depth === true) {
      var oldRenderBufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING);

      this.depthAttachments[0] = { handle:  gl.createRenderbuffer() };
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthAttachments[0].handle);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderBufferBinding);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthAttachments[0].handle);
    }
    else { //use supplied depth texture
      this.depthAttachments[0] = options.depth;
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthAttachments[0].handle, 0);
    }
  }

  this.checkFramebuffer();
  this.checkExtensions();

  //revert to old framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
  this.oldBinding = null;
}

RenderTarget.prototype.checkExtensions = function() {
  var gl = this.gl;
  if (Platform.isBrowser) {
    if (this.colorAttachments.length > 1) {
      this.webglDrawBuffersExt = gl.getExtension('WEBGL_draw_buffers');
      if (!this.webglDrawBuffersExt) {
        throw new Error('RenderTarget creating multiple render targets:' + this.colorAttachments.length + ' but WEBGL_draw_buffers is not available');
      }
    }
  }
}

RenderTarget.prototype.bind = function () {
  var gl = this.gl;
  this.oldBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
  if (this.colorAttachmentsPositions.length > 1) {
    if (Platform.isBrowser) {
      this.webglDrawBuffersExt.drawBuffersWEBGL(this.colorAttachmentsPositions);
    }
    else {
     gl.drawBuffers(this.colorAttachmentsPositions);
    }
  }
};

RenderTarget.prototype.bindAndClear = function () {
  var gl = this.gl;
  this.bind();

  gl.clearColor(0, 0, 0, 1);
  if (this.depthAttachments.length > 0) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  else {
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
};

RenderTarget.prototype.clear = function () {
  this.bindAndClear();
  this.unbind();
}

RenderTarget.prototype.unbind = function () {
  var gl = this.gl;
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.oldBinding);
  this.oldBinding = null;
  if (this.colorAttachmentsPositions.length > 1) {
    if (Platform.isBrowser) {
      this.webglDrawBuffersExt.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0]);
    }
    else {
     gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    }
  }
};

//assumes that the framebuffer is bound
RenderTarget.prototype.checkFramebuffer = function() {
  var gl = this.gl;
  var valid = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  switch(valid) {
    case gl.FRAMEBUFFER_UNSUPPORTED:                    throw new Error('Framebuffer is unsupported');
    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:          throw new Error('Framebuffer incomplete attachment');
    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:          throw new Error('Framebuffer incomplete dimensions');
    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:  throw new Error('Framebuffer incomplete missing attachment');
  }
}

RenderTarget.prototype.getColorAttachment = function (index) {
  index = index || 0;
  return this.colorAttachments[index];
};

RenderTarget.prototype.getDepthAttachement = function() {
  return this.depthAttachments[0];
}

 module.exports = RenderTarget;
