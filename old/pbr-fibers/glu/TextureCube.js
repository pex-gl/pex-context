var sys = require('pex-sys');
var glu = require('pex-glu');
var IO = sys.IO;
var Context = glu.Context;
var Texture = glu.Texture;

//### TextureCube ( )
//Does nothing, use *load()* method instead.
function TextureCube() {
  this.gl = Context.currentContext;
  Texture.call(this, this.gl.TEXTURE_CUBE_MAP);
}

TextureCube.prototype = Object.create(Texture.prototype); //HACKWB should be Texture

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
TextureCube.load = function (src, options, postfixes) {
  var gl = Context.currentContext;
  var texture = new TextureCube();
  var cubeMapTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    postfixes ? postfixes[0] : 'posx',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    postfixes ? postfixes[1] : 'negx',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    postfixes ? postfixes[2] : 'posy',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    postfixes ? postfixes[3] : 'negy',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    postfixes ? postfixes[4] : 'posz',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    postfixes ? postfixes[5] : 'negz'
  ];
  gl.bindTexture(texture.target, texture.handle);

  var magFilter = gl.LINEAR;
  var minFilter = gl.LINEAR;

  if (options.nearest) {
    magFilter = gl.NEAREST;
    minFilter = gl.NEAREST;
  }

  if (options.mipmap) {
    minFilter = gl.LINEAR_MIPMAP_LINEAR;
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  }

  gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  for (var i = 0; i < cubeMapTargets.length; i += 2) {
    var path = src.replace('####', cubeMapTargets[i + 1]);
    IO.loadImageData(gl, texture.handle, cubeMapTargets[i], path, { flip: false }, function (image) {
      texture.width = image.width;
      texture.height = image.height;
    });
  }
  return texture;
};

TextureCube.loadLod = function (src, postfixes, lods) {
  //return TextureCube.load(src, postfixes);
  var gl = Context.currentContext;
  var texture = new TextureCube();
  var cubeMapTargets = [
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    postfixes ? postfixes[0] : 'posx',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
    postfixes ? postfixes[1] : 'negx',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
    postfixes ? postfixes[2] : 'posy',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    postfixes ? postfixes[3] : 'negy',
    gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
    postfixes ? postfixes[4] : 'posz',
    gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    postfixes ? postfixes[5] : 'negz'
  ];
  var TEXTURE_BASE_LEVEL = 0x813C;
  var TEXTURE_MAX_LEVEL = 0x813D;
  gl.bindTexture(texture.target, texture.handle);
  gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(texture.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  console.log('gl.TEXTURE_BASE_LEVEL', gl.TEXTURE_BASE_LEVEL);

  //TODOWEB:gl.texParameteri(texture.target, TEXTURE_BASE_LEVEL, 0);
  //TODOWEB:gl.texParameteri(texture.target, TEXTURE_MAX_LEVEL, lods.length-1);
  for (var lod=0; lod<lods.length; lod++) {
    for (var i = 0; i < cubeMapTargets.length; i += 2) {
      var path = src.replace('####', cubeMapTargets[i + 1]).replace('LOD', lods[lod]);
      IO.loadImageData(gl, texture, cubeMapTargets[i], path, { flip: false, lod: lod }, function (image) {
        //console.log('TextureCube.loadLod', i, image.width)
        texture.width = image.width;
        texture.height = image.height;
      });
    }
  }
  return texture;
};

TextureCube.prototype.generateMipmap = function() {
  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.handle);
  this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
}

//### dispose ( )
//Frees the texture data.
TextureCube.prototype.dispose = function () {
  if (this.handle) {
    this.gl.deleteTexture(this.handle);
    this.handle = null;
  }
};

module.exports = TextureCube;
