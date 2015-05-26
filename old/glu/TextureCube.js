var sys = require('pex-sys');
var IO = sys.IO;
var Platform = sys.Platform;
var Context = require('./Context');
var Texture = require('./Texture');
var merge = require('merge');

//### TextureCube ( )
//Does nothing, use *load()* method instead.
function TextureCube() {
  this.gl = Context.currentContext;
  Texture.call(this, this.gl.TEXTURE_CUBE_MAP);
}

TextureCube.prototype = Object.create(Texture.prototype);

//### load ( src )
//Load texture from file (in Plask) or url (in the web browser).
//
//`src` - path to file or url (e.g. *path/file_####.jpg*) *{ String }*
//
//Returns the loaded texture *{ Texture2D }*
//
//*Note* the path or url must contain #### that will be replaced by
//id (e.g. *posx*) of the cube side*
//
//*Note: In Plask the texture is ready immediately, in the web browser it's
//first black until the file is loaded and texture can be populated with the image data.*
TextureCube.load = function (files, options, callback) {
  var defaultOptions = {
    mipmap: false,
    nearest: false
  };
  options = merge(defaultOptions, options);

  var gl = Context.currentContext;
  var texture = new TextureCube();
  var cubeMapTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
  ];

  var minFilter = gl.LINEAR;
  var magFilter = gl.LINEAR;

  if (options.nearest) {
    magFilter = gl.NEAREST;
    minFilter = gl.NEAREST;
  }

  if (options.mipmap || files.length > 6) {
    minFilter = gl.LINEAR_MIPMAP_LINEAR;
  }

  gl.bindTexture(texture.target, texture.handle);
  gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  texture.ready = false;
  var loadedImages = 0;
  for (var i = 0; i < files.length; i++) {
    IO.loadImageData(gl, texture.handle, texture.target, cubeMapTargets[i%6], files[i], { flip: false, lod: Math.floor(i/6) }, function (image) {
      texture.width = image.width;
      texture.height = image.height;
      if (++loadedImages == files.length) {
        if (options.mipmap) {
          gl.bindTexture(texture.target, texture.handle);
          gl.generateMipmap(texture.target);
        }
        texture.ready = true;
        if (callback) callback(texture);
      }
    });
  }
  return texture;
};

//### dispose ( )
//Frees the texture data.
TextureCube.prototype.dispose = function () {
  if (this.handle) {
    this.gl.deleteTexture(this.handle);
    this.handle = null;
  }
};

module.exports = TextureCube;
