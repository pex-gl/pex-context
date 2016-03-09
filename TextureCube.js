var isPlask = require('is-plask');
var plask   = isPlask ? require('plask') : {};

//TODO: update width and height if not passed but data is Image or Canvas
//facesData = Array of {
//  face - face index 0..6 for +x, -x, +y, -y, +z, -z
//  level - mipmap level
//  width - faceWidth,
//  height - faceHeight
//  data - faceData - SkCanvas, HTMLCanvas, ImageData, TypeArray
// }
function TextureCube(ctx, facesData, width, height, options) {
    this._ctx        = ctx;
    var gl           = ctx.getGL();
    this._handle     = gl.createTexture();
    this._target     = gl.TEXTURE_CUBE_MAP;
    this._width      = width  || (facesData && facesData[0] && facesData[0].data.width ) || 0;
    this._height     = height || (facesData && facesData[0] && facesData[0].data.height) || 0;

    //TODO: remember these settings
    var internalFormat  = (options && options.format     ) || gl.RGBA;
    var format          = (options && options.format     ) || gl.RGBA;
    var repeat          = (options && options.repeat     ) || false;
    var dataType        = (options && options.type       ) || gl.UNSIGNED_BYTE;
    var flipY           = (options && options.flipY      ) || false;
    var magFilter       = (options && options.magFilter  ) || gl.LINEAR;
    var minFilter       = (options && options.minFilter  ) || gl.LINEAR;
    var lod            = 0;

    //TODO: Should we push stack here?
    //ctx.pushState(ctx.TEXTURE_BIT);
    ctx.bindTexture(this, 0);

    var wrapS = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    var wrapT = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, minFilter);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, wrapT);

    if (format == gl.DEPTH_COMPONENT && !ctx.isSupported(ctx.CAPS_DEPTH_TEXTURE)) {
        throw new Error('TextureCube - Depth Texture format is not supported');
    }

    if (dataType == gl.FLOAT && !ctx.isSupported(ctx.CAPS_TEXTURE_FLOAT)) {
        throw new Error('TextureCube - Float type is not supported');
    }

    if (dataType == gl.HALF_FLOAT && !ctx.isSupported(ctx.CAPS_TEXTURE_HALF_FLOAT)) {
        throw new Error('TextureCube - Half Float type is not supported');
    }

    this.update(facesData, width, height, options);
    //ctx.popState(ctx.TEXTURE_BIT);
}

TextureCube.prototype.update = function(facesData, width, height, options) {
    var ctx = this._ctx;
    var gl  = ctx.getGL();

    //TODO: Should we push stack here?
    ctx.bindTexture(this, 0);

    //TODO: this should remember settings from constructor
    var internalFormat  = (options && options.format    ) || gl.RGBA;
    var format          = (options && options.format    ) || gl.RGBA;
    var repeat          = (options && options.repeat    ) || false;
    var dataType        = (options && options.type      ) || gl.UNSIGNED_BYTE;
    var flipY           = (options && options.flipY     ) || false;
    var lod             = (options && options.lod       ) || 0;

    var numFaces = facesData ? facesData.length : 6;

    this._width      = width  || (facesData && facesData[0] && facesData[0].data.width ) || 0;
    this._height     = height || (facesData && facesData[0] && facesData[0].data.height) || 0;

    for(var i=0; i<numFaces; i++) {
        var face = facesData ? facesData[i] : null;
        var data = facesData ? face.data : null;
        var width = facesData ? face.width : width;
        var height = facesData ? face.height : width;
        var lod = facesData ? (face.lod || 0) : 0;
        var faceSide = facesData ? (face.face || i) : i;
        var target = ctx.TEXTURE_CUBE_MAP_POSITIVE_X + faceSide;
        if (!data) {
            gl.texImage2D(target, lod, internalFormat, width, height, 0, format, dataType, null);
        }
        else if (isPlask) {
            if (data instanceof plask.SkCanvas) {
                if (flipY) {
                  gl.texImage2DSkCanvas(target, lod, data);
                }
                else {
                  gl.texImage2DSkCanvasNoFlip(target, lod, data);
                }
            }
            else {
                gl.texImage2D(target, lod, internalFormat, width, height, 0, format, dataType, data);
            }
        }
        else { //assuming Browser
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY);
            //Image, ImageData or Canvas
            if (data.width && data.height) {
                gl.texImage2D(target, lod, internalFormat, format, dataType, data);
            }
            //Array buffer
            else {
                console.log(dataType, 'gl.FLOAT', ctx.FLOAT);
                gl.texImage2D(target, lod, internalFormat, width, height, 0, format, dataType, data);
            }
        }
    }
}

TextureCube.prototype._bindInternal = function() {
    var gl  = this._ctx.getGL();
    gl.bindTexture(this._target, this._handle);
}

TextureCube.prototype.getHandle = function() {
    return this._handle;
}

TextureCube.prototype.getTarget = function() {
    return this._target;
}

TextureCube.prototype.getWidth = function() {
    return this._width;
}

TextureCube.prototype.getHeight = function() {
    return this._height;
}

TextureCube.prototype.dispose = function(){
    var gl  = this._ctx.getGL();
    gl.deleteTexture(this._handle);
    this._width = 0;
    this._height = 0;
};

module.exports = TextureCube;
