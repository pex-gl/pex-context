var Platform = require('../sys/Platform');

function Texture2D(ctx, data, width, height, options) {
    var gl = this._gl = ctx.getGL();
    this._handle     = gl.createTexture();
    this._target     = gl.TEXTURE_2D;
    this._width      = width;
    this._height     = height;

    //TODO: implement options / sampler object
    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
    var lod             = 0;

    //FIXME: use context to bind texture
    this._bindInternal();
    //FIXME: this doesn't matter as long as we keep the currently bound texture
    gl.activeTexture(gl.TEXTURE0);

    //TODO: Is this needed? We are pushing data below anyway?
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, dataType, null);

    var wrapS = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var wrapT = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var magFilter = gl.LINEAR;
    var minFilter = gl.LINEAR;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

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
        gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, format, dataType, data);
    }

    //FIXME: use context to unbind texture
    gl.bindTexture(gl.TEXTURE_2D, null);
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
