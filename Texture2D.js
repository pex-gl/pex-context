var isBrowser = require('is-browser');
var plask = require('plask');

//TODO: update width and height if not passed but data is Image or Canvas
function Texture2D(ctx, data, width, height, options) {
    this._ctx        = ctx;
    var gl           = ctx.getGL();
    this._handle     = gl.createTexture();
    this._target     = gl.TEXTURE_2D;
    this._width      = width;
    this._height     = height;

    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
    var magFilter       = (options && options.magFilter  ) || gl.LINEAR;
    var minFilter       = (options && options.minFilter  ) || gl.LINEAR;
    var lod             = 0;
    var compressed      = (options && options.compressed) || false;

    //TODO: Should we push stack here?
    ctx.bindTexture(this, 0);

    var wrapS = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var wrapT = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    if (isBrowser && (format == gl.DEPTH_COMPONENT)) {
        //TODO: Not required in WebGL 2.0
        //TODO: Throw on extension not supported?
        gl.getExtension('WEBGL_depth_texture');
    }

    this.update(data, width, height, options);
}

//TODO: update width and height if not passed but data is Image or Canvas
Texture2D.prototype.update = function(data, width, height, options) {
    var ctx = this._ctx;
    var gl  = ctx.getGL();

    //TODO: Should we push stack here?
    ctx.bindTexture(this, 0);

    //TODO: this should remember settings from constructor
    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
    var lod             = (options && options.lod   ) || 0;
    var compressed      = (options && options.compressed) || false;

    if (!data) {
        gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, null);
    }
    else if (isBrowser) {
        if (compressed == 'dxt1') {
            var ext = gl.getExtension('WEBGL_compressed_texture_s3tc');
            gl.compressedTexImage2D(gl.TEXTURE_2D, lod, ext.COMPRESSED_RGB_S3TC_DXT1_EXT, width, height, 0, data);
        }
        if (compressed == 'dxt5') {
            var ext = gl.getExtension('WEBGL_compressed_texture_s3tc');
            gl.compressedTexImage2D(gl.TEXTURE_2D, lod, ext.COMPRESSED_RGBA_S3TC_DXT5_EXT, width, height, 0, data);
        }
        else {
            //gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, data);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
            //Image, ImageData or Canvas
            if (data.width && data.height) {
                gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, format, dataType, data);
            }
            //Array buffer
            else {
                //TODO: set flip flag
                gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, data);
            }
        }
    }
    else { //assuming Plask
        if (data instanceof plask.SkCanvas) {
            if (flip) {
              gl.texImage2DSkCanvas(this._target, lod, data);
            }
            else {
              gl.texImage2DSkCanvasNoFlip(this._target, lod, data);
            }
        }
        else {
            if (compressed) {
                if (compressed == 'dxt1') {
                    gl.compressedTexImage2D(gl.TEXTURE_2D, 0, gl.COMPRESSED_RGB_S3TC_DXT1_EXT, width, height, 0, data);
                }
                if (compressed == 'dxt5') {
                    gl.compressedTexImage2D(gl.TEXTURE_2D, lod, gl.COMPRESSED_RGBA_S3TC_DXT5_EXT, width, height, 0, data);
                }
            }
            else {
                gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, data);
            }
        }
    }
}

Texture2D.prototype._bindInternal = function() {
    var gl  = this._ctx.getGL();
    gl.bindTexture(this._target, this._handle);
}

Texture2D.prototype.getHandle = function() {
    return this._handle;
}

Texture2D.prototype.getTarget = function() {
    return this._target;
}

Texture2D.prototype.getWidth = function() {
    return this._width;
}

Texture2D.prototype.getHeight = function() {
    return this._height;
}


Texture2D.prototype.dispose = function(){
    var gl  = this._ctx.getGL();
    gl.deleteTexture(this._handle);
    this._width = 0;
    this._height = 0;
};

module.exports = Texture2D;
