var Platform = require('../sys/Platform');

function Texture2D(ctx, data, width, height, options) {
    this._ctx        = ctx;
    var gl           = this._gl = ctx.getGL();
    this._handle     = gl.createTexture();
    this._target     = gl.TEXTURE_2D;
    this._width      = width;
    this._height     = height;

    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
    var lod             = 0;

    //TODO: Should we push stack here?
    ctx.bindTexture(this, 0);

    var wrapS = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var wrapT = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var magFilter = gl.LINEAR;
    var minFilter = gl.LINEAR;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    this.update(data, width, height, options);
}

Texture2D.prototype.update = function(data, width, height, options) {
    var ctx = this._ctx;
    var gl  = this._gl;

    //TODO: Should we push stack here?
    ctx.bindTexture(this, 0);

    //TODO: this should remember settings from constructor
    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
    var lod             = (options && options.lod   ) || 0;

    if (Platform.isPlask) {
        if (flip) {
          gl.texImage2DSkCanvas(this._target, lod, data);
        }
        else {
          gl.texImage2DSkCanvasNoFlip(this._target, lod, data);
        }
    }
    else if (Platform.isBrowser) {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
        //Image, ImageData or Canvas
        if (data.width && data.height) {
            gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, format, dataType, data);
        }
        //Array buffer
        else {
            gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, data);
        }
    }
}

Texture2D.prototype._bindInternal = function() {
    this._gl.bindTexture(this._target, this._handle);
}

Texture2D.prototype.dispose = function(){
    this._gl.deleteTexture(this._handle);
    this._width = 0;
    this._height = 0;
};

module.exports = Texture2D;
