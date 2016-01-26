var isBrowser = require('is-browser');
var plask     = isBrowser ? {} : require('plask');

//TODO: update width and height if not passed but data is Image or Canvas
function Texture2D(ctx, data, width, height, options) {
    this._ctx        = ctx;
    var gl           = ctx.getGL();
    this._handle     = gl.createTexture();
    this._target     = gl.TEXTURE_2D;
    this._width      = width  || (data && data.width ) || 0;
    this._height     = height || (data && data.height) || 0;

    this.update(data, width, height, options);
}

//TODO: update width and height if not passed but data is Image or Canvas
//NOTE: flipY for compressed images is not supported
Texture2D.prototype.update = function(data, width, height, options) {
    var ctx = this._ctx;
    var gl  = ctx.getGL();

    width  = this._width  = width  || (data && data.width ) || 0;
    height = this._height = height || (data && data.height) || 0;

    ctx.pushState(gl.TEXTURE_BIT);
    ctx.bindTexture(this, 0);

    //TODO: this should remember settings from constructor
    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var lod             = (options && options.lod   ) || 0;
    //TODO: redo this so we don't depend on strings
    var compressed      = (options && options.compressed) || false;
    var flipY           = (options && options.flipY !== undefined) ? options.flipY : true;

    var repeat          = (options && options.repeat    ) || false;
    var magFilter       = (options && options.magFilter ) || gl.LINEAR;
    var minFilter       = (options && options.minFilter ) || gl.LINEAR;

    if (options && options.mipmap) {
        minFilter = gl.LINEAR_MIPMAP_LINEAR;
    }

    var wrapS = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var wrapT = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    if (format == ctx.DEPTH_COMPONENT && !ctx.isSupported(ctx.CAPS_DEPTH_TEXTURE)) {
        throw new Error('Texture2D - Depth Texture format is not supported');
    }

    if (dataType == ctx.FLOAT && !ctx.isSupported(ctx.CAPS_TEXTURE_FLOAT)) {
        throw new Error('Texture2D - Float type is not supported');
    }

    //TODO: is that working at all?, if extension is not supported then ctx.HALF_FLOAT is undefined?
    if (dataType == ctx.HALF_FLOAT && !ctx.isSupported(ctx.CAPS_TEXTURE_HALF_FLOAT)) {
        throw new Error('Texture2D - Half Float type is not supported');
    }

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
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
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
    else { //assuming Plask
        if (data instanceof plask.SkCanvas) {
            //FIXME: using SKCanvas methods ignores format and internal format which forces RGBA and doesn't allow e.g. SRGB
            if (flipY) {
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
                if (flipY) {
                    flipImageData(data, width, height);
                }
                gl.texImage2D(gl.TEXTURE_2D, lod, internalFormat, width, height, 0, format, dataType, data);
                if (flipY) {
                    //unflip it
                    flipImageData(data, width, height);
                }
            }
        }
    }

    if (options && options.mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    ctx.popState(gl.TEXTURE_BIT);
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

function flipImageData(data, width, height) {
    var numComponents = data.length / (width * height);
    //flipping array buffer in place
    for(var y=0; y<height/2; y++) {
        for(var x=0; x<width; x++) {
            for(var c=0; c<numComponents; c++) {
                var i = (y * width + x) * numComponents + c;
                var flippedI = ((height - y - 1) * width + x) * numComponents + c;
                var tmp = data[i];
                data[i] = data[flippedI];
                data[flippedI] = tmp
            }
        }
    }
}

module.exports = Texture2D;
