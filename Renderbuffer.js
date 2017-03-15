function Renderbuffer(ctx, width, height, options) {
    var gl = ctx.getGL();

    options = options || {};

    var format = options.format || gl.RGBA4;
    var samples = options.samples || 0;
    var maxSamples = gl.MAX_SAMPLES ? gl.getParameter(gl.MAX_SAMPLES) : 0;
    if (samples && maxSamples) {
        samples = Math.min(samples, maxSamples);
    }

    this._ctx = ctx;
    this._width = width;
    this._height = height;
    this._target = gl.RENDERBUFFER;

    var oldRenderBufferBinding = gl.getParameter(gl.RENDERBUFFER_BINDING);
    this._handle = gl.createRenderbuffer();

    //TODO: ctx.bindRenderbuffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, this._handle);
    //gl.getError(); //reset error

    //void renderbufferStorageMultisample(GLenum target, GLsizei samples, GLenum internalformat, GLsizei width, GLsizei height) (OpenGL ES 3.0.4 §4.4.2, man page)

    if (samples && gl.renderbufferStorageMultisample) {
        gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, format, width, height)
        //gl.enable(gl.MULTISAMPLE)
    }
    else {
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, width, height);
    }

    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
    //if (gl.getError() || !gl.DEPTH_COMPONENT24) {
    //24 bit depth buffer might be not available, trying with 16
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
    //}

    //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, oldRenderBufferBinding);
}

Renderbuffer.prototype.getWidth = function() {
    return this._width;
}

Renderbuffer.prototype.getHeight = function() {
    return this._height;
}

Renderbuffer.prototype.getHandle = function() {
    return this._handle;
}

Renderbuffer.prototype.getTarget = function() {
    return this._target;
}

module.exports = Renderbuffer;
