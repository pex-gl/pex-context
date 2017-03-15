var isBrowser = !require('is-plask');

/**
 * Assumptions:
 * - colorAttachments is an array or null
 * - depthAttachment is a Texture or null
 * - no support for automatically created textures as color targets
 * - no support for automatically created depth render buffers or textures as depth targets
 */

function glConstant(gl, c) {
  for (i in gl) {
    if (gl[i] == c) return i
  }
}

// colorAttachments = [ { texture: Texture2D, level: Int, target: GLEnum }, ...]
// colorAttachments = [ Texture2D, ...]
function Framebuffer(ctx, colorAttachments, depthAttachment) {
  this._ctx = ctx;
  var gl = ctx.getGL();

  this._handle = gl.createFramebuffer();
  this._colorAttachments = [];
  this._colorAttachmentsPositions = [];
  this._depthAttachment = null;
  this._width = 0;
  this._height = 0;

  //TODO: how to handle that?
  if (isBrowser) {
    //TODO: Not required in WebGL 2.0
    //TODO: Throw on extension not supported?
    this._webglDrawBuffersExt = gl.getExtension('WEBGL_draw_buffers');
    console.log(this._webglDrawBuffersExt)
  }

  if (colorAttachments) {
    colorAttachments = colorAttachments.map((attachment) => {
      return attachment.texture ? attachment : {
        texture: attachment,
        level: 0,
        target: attachment.getTarget()
      }
    })
  }

  if (colorAttachments && colorAttachments[0]) {
    this._width = colorAttachments[0].texture.getWidth();
    this._height = colorAttachments[0].texture.getHeight();
  }
  else if (depthAttachment) {
    this._width = depthAttachment.texture.getWidth();
    this._height = depthAttachment.texture.getHeight();
  }

  ctx.bindFramebuffer(this); //TODO: Should we push and pop?

  if (colorAttachments) {
    for(var i=0; i<colorAttachments.length; i++) {
      var colorAttachment = colorAttachments[i];
      var colorTexture = colorAttachment.texture;
      var level = colorAttachment.level || 0;
      var target = colorAttachment.target || colorTexture.getTarget();
      var handle = colorTexture.getHandle();
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, target, handle, level);
      this._colorAttachments.push(colorAttachment);
      this._colorAttachmentsPositions.push(gl.COLOR_ATTACHMENT0 + i);
    }
  }

  if (depthAttachment) {
    var depthTexture = depthAttachment.texture;
    var target = depthTexture.getTarget() || depthAttachment.target;
    var level = depthAttachment.level || 0;
    var handle = depthTexture.getHandle();
    console.log(gl.getError())
    console.log(glConstant(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, target, handle, level);
    console.log(gl.getError())
    console.log(glConstant(gl, gl.checkFramebufferStatus(gl.FRAMEBUFFER)))
    this._depthAttachment = depthAttachment;
    // TODO: throw on error
  }

  //TODO: unbind -> pop?
  ctx.bindFramebuffer(null);
}

//TODO: should i save setColorAttachment to _colorAttachments
Framebuffer.prototype.setColorAttachment = function(attachment, textureTarget, textureHandle, level) {
  var gl = this._ctx.getGL();
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + attachment, textureTarget, textureHandle, level);
}

Framebuffer.prototype.getColorAttachment = function(attachment) {
  return this._colorAttachments[attachment];
}

//TODO: should i save setDepthAttachment to _depthAttachment
Framebuffer.prototype.setDepthAttachment = function(textureTarget, textureHandle, level) {
  var gl = this._ctx.getGL();
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, textureTarget, textureHandle, level);
}

Framebuffer.prototype.getDepthAttachment = function() {
  return this._depthAttachment;
}

Framebuffer.prototype.getWidth = function() {
  return this._width;
}

Framebuffer.prototype.getHeight = function() {
  return this._height;
}

Framebuffer.prototype._bindInternal = function() {
  var gl  = this._ctx.getGL();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this._handle);

  if (this._colorAttachmentsPositions.length > 1) {
    if (isBrowser) {
      this._webglDrawBuffersExt.drawBuffersWEBGL(this._colorAttachmentsPositions);
    }
    else {
      gl.drawBuffers(this._colorAttachmentsPositions);
    }
  }
}

module.exports = Framebuffer;
