var _gl = require('./gl'),
    _Math = require('../math/Math'),
    Vec2 = require('../math/Vec2'),
    ObjectUtil = require('../util/ObjectUtil'),
    Texture = require('./Texture');

/**
 * Framebuffer object for offscreen rendering.
 * @param {Number} width - The width
 * @param {Number} height - The height
 * @param {Fbo.Format} [format] - The format
 * @constructor
 */

function Fbo(width,height,format){
    this._format = format = format === undefined ? new Fbo.Format() : format.copy();
    this._width  = width;
    this._height = height;

    var gl = this._gl = _gl.get();
    var pot = _Math.isPOT(width) && _Math.isPOT(height);

    if(!pot && (format.wrapS == gl.REPEAT || format.wrapT == gl.REPEAT)){
        throw new Error('TEXTURE: Texture size must be power of 2 if wrapmode REPEAT is used.');
    }
    if(pot && format.mipmapping){
        throw new Error('TEXTURE: Texture size must be power of 2 when generating mipmap.');
    }

    this._renderBuffer = gl.createRenderbuffer();
    this._frameBuffer  = gl.createFramebuffer();
    this._texture      = gl.createTexture();
    this._textureUnit  = 0;

    var prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D);

    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, format.magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, format.minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, format.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, format.wrapT);
    if(format.mipmapping){
        gl.generateMipmap(gl.TEXTURE_2D);
    }
    gl.bindTexture(gl.TEXTURE_2D,prevTex);

    this.resizef(width,height);
}

/**
 * Format for fbo.
 * @constructor
 */

Fbo.Format = function(){
    Texture.Format.call(this);

    this.dataFormat = _gl.get().RGBA;
    this.depthBuffer = false;
    this.stencilBuffer = false;
    //this.numColorBuffers = 1;
};

Fbo.Format.prototype = Object.create(Texture.Format);
Fbo.Format.prototype.constructor = Fbo.Format;

/**
 * Returns a copy of the format.
 * @param {Fbo.Format} [format] - Out format
 * @returns {Fbo.Format}
 */

Fbo.Format.prototype.copy = function(format){
    format = format || new Fbo.Format();
    format.wrapS = this.wrapS;
    format.wrapT = this.wrapT;
    format.minFilter = this.minFilter;
    format.magFilter = this.magFilter;
    format.mipmapping = this.mipmapping;
    format.dataFormatInternal = this.dataFormatInternal;
    format.dataFormat = this.dataFormat;
    format.dataType = this.dataType;
    format.depthBuffer = this.depthBuffer;
    format.stencilBuffer = this.stencilBuffer;
    return format;
};

/**
 * Resizes the fbo. Clears buffered content.
 * @param width
 * @param height
 * @returns {Fbo}
 */

Fbo.prototype.resizef = function(width,height){
    var gl = this._gl, format = this._format;
    var prevTex = gl.getParameter(gl.TEXTURE_BINDING_2D),
        prevRbo = gl.getParameter(gl.RENDERBUFFER_BINDING),
        prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    var renderBuffer = this._renderBuffer,
        texture      = this._texture;


    gl.bindFramebuffer(gl.FRAMEBUFFER,this._frameBuffer);

    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height,0, format.dataFormat, format.dataType, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.bindRenderbuffer(gl.RENDERBUFFER, prevRbo);
    gl.bindFramebuffer(gl.FRAMEBUFFER,prevFbo);

    this._width  = width;
    this._height = height;

    return this;
};

/**
 * Resizes the fbo. Clears buffered content.
 * @param size
 * @returns {Fbo}
 */

Fbo.prototype.resize = function (size) {
    return this.resizef(size.x,size.y);
};

/**
 * Returns the width of the fbo.
 * @returns {Number}
 */

Fbo.prototype.getWidth = function(){
    return this._width;
};

/**
 * Returns the height of the fbo.
 * @returns {Number}
 */

Fbo.prototype.getHeight = function(){
    return this._height;
};

/**
 * Returns the size of the fbo.
 * @param {Vec2} [v] - Out size
 * @returns {Vec2}
 */

Fbo.prototype.getSize = function(v){
    return (v || new Vec2()).setf(this._width,this._height);
};

/**
 * Binds the fbo.
 * @returns {Fbo}
 */

Fbo.prototype.bind = function(){
    var gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
    return this;
};

/**
 * Unbinds the fbo.
 * @returns {Fbo}
 */

Fbo.prototype.unbind = function(){
    var gl = this._gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this;
};

/**
 * Binds the texture rendered to.
 * @param {Number} [unit] - The texture unit
 * @returns {Fbo}
 */

Fbo.prototype.bindTexture = function(unit){
    var gl = this._gl;
    if(!ObjectUtil.isUndefined(unit)){
        this._textureUnit = unit;
        gl.activeTexture(gl.TEXTURE0 + unit);
    }
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    return this;
};

/**
 * Unbinds the texture rendered to.
 * @param {Number} [unit] - The texture unit
 * @returns {Fbo}
 */

Fbo.prototype.unbindTexture = function(unit){
    var gl = this._gl;
    if(!ObjectUtil.isUndefined(unit)){
        gl.activeTexture(gl.TEXTURE0 + unit);
    } else {
        gl.activeTexture(gl.TEXTURE0 + this._textureUnit);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);
    return this;
};

/**
 * Returns the texture´s unit.
 * @returns {number}
 */

Fbo.prototype.getTextureUnit = function(){
    return this._textureUnit;
};

/**
 * Deletes the fbo.
 * @returns {Fbo}
 */

Fbo.prototype.dispose = function(){
    var gl = this._gl;
    gl.deleteTexture(this._texture);
    gl.deleteFramebuffer(this._frameBuffer);
    gl.deleteRenderbuffer(this._renderBuffer);
    return this;
};


module.exports = Fbo;