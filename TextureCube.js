var Platform = require('pex-sys/Platform');
var plask = require('plask');

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
    this._width      = width;
    this._height     = height;

    var internalFormat  = (options && options.format) || gl.RGBA;
    var format          = (options && options.format) || gl.RGBA;
    var repeat          = (options && options.repeat) || false;
    var dataType        = (options && options.type  ) || gl.UNSIGNED_BYTE;
    var flip            = (options && options.flip  ) || false;
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

    if (Platform.isBrowser && (format == gl.DEPTH_COMPONENT)) {
        //TODO: Not required in WebGL 2.0
        //TODO: Throw on extension not supported?
        gl.getExtension('WEBGL_depth_texture');
    }

    this.update(facesData, width, height, options);
    //ctx.popState(ctx.TEXTURE_BIT);
}

//TODO: update width and height if not passed but data is Image or Canvas
TextureCube.prototype.update = function(facesData, options) {
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


    for(var i=0; i<facesData.length; i++) {
        var face = facesData[i];
        var data = face.data;
        var width = face.width;
        var height = face.height;
        var lod = face.lod;
        var target = ctx.TEXTURE_CUBE_MAP_POSITIVE_X + face.face;
        if (!data) {
            gl.texImage2D(target, lod, internalFormat, width, height, 0, format, dataType, null);
        }
        else if (Platform.isPlask) {
            if (data instanceof plask.SkCanvas) {
                if (flip) {
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
        else if (Platform.isBrowser) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flip);
            //Image, ImageData or Canvas
            if (data.width && data.height) {
                gl.texImage2D(target, lod, internalFormat, format, dataType, data);
            }
            //Array buffer
            else {
                //TODO: set flip flag
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
