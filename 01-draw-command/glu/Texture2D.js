var assign = require('object-assign');
//var TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;
var Platform = require('../sys/Platform');

function Texture2D(gl) {
  this.gl = gl
  this.handle = this.gl.createTexture();
}

Texture2D.create = function(gl, w, h, options) {
  var defaultOptions = {
    repeat: false,
    mipmap: false,
    nearest: false,
    internalFormat: gl.RGBA,
    format: gl.RGBA,
    type: gl.UNSIGNED_BYTE
  };
  options = assign(defaultOptions, options);
  options.internalFormat = options.format;

  if (options.bpp == 32) {
    options.type = gl.FLOAT;
  }

  var texture = new Texture2D(gl);
  texture.bind();

  texture.checkExtensions(options);

  gl.texImage2D(gl.TEXTURE_2D, 0, options.internalFormat, w, h, 0, options.format, options.type, null);

  var wrapS = options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  var wrapT = options.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  var magFilter = gl.LINEAR;
  var minFilter = gl.LINEAR;

  if (options.nearest) {
    magFilter = gl.NEAREST;
    minFilter = gl.NEAREST;
  }

  if (options.mipmap) {
    minFilter = gl.LINEAR_MIPMAP_LINEAR;
  }

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
  gl.bindTexture(gl.TEXTURE_2D, null);

  texture.width = w;
  texture.height = h;
  texture.target = gl.TEXTURE_2D;
  return texture;
};

//FIXME: plask only
Texture2D.prototype.update = function(canvas, flip) {
  var gl = this.gl;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.handle);
  if (flip) {
    gl.texImage2DSkCanvas(gl.TEXTURE_2D, 0, canvas);
  }
  else {
    gl.texImage2DSkCanvasNoFlip(gl.TEXTURE_2D, 0, canvas);
  }
}

//Texture2D.prototype.anisotropy = function(level) {
//  var gl = Context.currentContext;
//  this.bind();
//  gl.texParameterf(gl.TEXTURE_2D, TEXTURE_MAX_ANISOTROPY_EXT, Math.floor(level));
//  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//  gl.bindTexture(gl.TEXTURE_2D, null);
//}

Texture2D.prototype.checkExtensions = function(options) {
  var gl = this.gl;
  if (Platform.isBrowser) {
    if (options.format == gl.DEPTH_COMPONENT) {
      var depthTextureExt = gl.getExtension('WEBGL_depth_texture');
      if (!depthTextureExt) {
        throw new Error('Texture2D creating texture with format:gl.DEPTH_COMPONENT but WEBGL_depth_texture is not available');
      }
    }
    if (options.type == gl.FLOAT) {
      if (Platform.isMobile) {
        var textureHalfFloatExt = gl.getExtension('OES_texture_half_float');
        if (!textureHalfFloatExt) {
          throw new Error('Texture2D creating texture with type:gl.FLOAT but OES_texture_half_float is not available');
        }
        var textureHalfFloatLinerExt = gl.getExtension('OES_texture_half_float_linear');
        if (!textureHalfFloatLinerExt) {
          throw new Error('Texture2D creating texture with type:gl.FLOAT but OES_texture_half_float_linear is not available');
        }
        options.type = textureHalfFloatExt.HALF_FLOAT_OES;
      }
      else {
        var textureFloatExt = gl.getExtension('OES_texture_float');
        if (!textureFloatExt) {
          throw new Error('Texture2D creating texture with type:gl.FLOAT but OES_texture_float is not available');
        }
        var textureFloatLinerExt = gl.getExtension('OES_texture_float_linear');
        if (!textureFloatLinerExt) {
          throw new Error('Texture2D creating texture with type:gl.FLOAT but OES_texture_float_linear is not available');
        }
      }
    }
  }
}

Texture2D.prototype.bind = function(unit) {
  unit = unit ? unit : 0;
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
};

Texture2D.genNoise = function(gl, w, h) {
  w = w || 256;
  h = h || 256;
  var texture = new Texture2D(gl);
  texture.bind();
  //TODO: should check unpack alignment as explained here https://groups.google.com/forum/#!topic/webgl-dev-list/wuUZP7iTr9Q
  var b = new ArrayBuffer(w * h * 2);
  var pixels = new Uint8Array(b);
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      pixels[y * w + x] = Math.floor(Math.random() * 255);
    }
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
  texture.width = w;
  texture.height = h;
  return texture;
};

Texture2D.load = function(src, options, callback) {
  if (!callback && typeof(options) == 'function') {
    callback = options;
    options = null;
  }
  var defaultOptions = {
    repeat: false,
    mipmap: false,
    nearest: false,
    flip: true
  };
  options = merge(defaultOptions, options);

  var gl = Context.currentContext;
  var texture = Texture2D.create(0, 0, options);
  texture.ready = false;
  IO.loadImageData(gl, texture.handle, texture.target, texture.target, src, { flip: options.flip, crossOrigin: options.crossOrigin }, function(image) {
    if (!image) {
      texture.dispose();
      var noise = Texture2D.getNoise();
      texture.handle = noise.handle;
      texture.width = noise.width;
      texture.height = noise.height;
    }
    if (options.mipmap) {
      texture.generateMipmap();
    }
    gl.bindTexture(texture.target, null);
    texture.width = image.width;
    texture.height = image.height;
    texture.ready = true;
    if (callback) {
      callback(texture);
    }
  });
  return texture;
};

Texture2D.prototype.dispose = function() {
  if (this.handle) {
    this.gl.deleteTexture(this.handle);
    this.handle = null;
  }
};

Texture2D.prototype.generateMipmap = function() {
  this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
  this.gl.generateMipmap(this.gl.TEXTURE_2D);
}

module.exports = Texture2D;
