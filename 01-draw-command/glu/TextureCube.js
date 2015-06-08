var Platform = {};

function TextureCube(gl, images) {
  this.gl = gl;
  this.handle = this.gl.createTexture();

  if (images.then) {
    images.then(function(images) {
      try {
        this.update(images);
      }
      catch(e) {
        console.log(e);
      }
    }.bind(this));
  }
  else {
    this.update(images);
  }
}


TextureCube.prototype.update = function(images) {
  var gl = this.gl;
  this.bind();


  var lod = 0;
  var flip = false;

  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  //Plask
  for(var i=0; i<6; i++) {
    var dataTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + i;
    var canvas = images[i];
    if (flip) {
      gl.texImage2DSkCanvas(dataTarget, lod, canvas);
    }
    else {
      gl.texImage2DSkCanvasNoFlip(dataTarget, lod, canvas);
    }
  }
}

TextureCube.prototype.bind = function(unit) {
  unit = unit ? unit : 0;
  this.gl.activeTexture(this.gl.TEXTURE0 + unit);
  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.handle);
};

module.exports = TextureCube;
