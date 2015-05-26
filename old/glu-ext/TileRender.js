var PerspectiveCamera = require('pex-glu').PerspectiveCamera;
var Context = require('pex-glu').Context;
var Mat4 = require('pex-geom').Mat4;
var gm = require('gm');

var PI    = Math.PI;
var tan   = Math.tan;
var floor = Math.floor;

// this frustum(l, r, b, t, n, f)
//
// Multiply by a frustum matrix computed from left, right, bottom, top,
// near, and far.
Mat4.prototype.frustum = function(l, r, b, t, n, f) {
  this.mul4x4r(
      (n+n)/(r-l),           0, (r+l)/(r-l),             0,
                0, (n+n)/(t-b), (t+b)/(t-b),             0,
                0,           0, (f+n)/(n-f), (2*f*n)/(n-f),
                0,           0,          -1,             0);

  return this;
};

function TileRender(opts) {
  this.opts = opts;

  this.opts.n = this.opts.n || 1;
  this.numTiles = this.opts.n * this.opts.n;
  this.currentTile = 0;

  this.tileCamera = new PerspectiveCamera();
  this.tileCamera.setFov(this.opts.camera.getFov());
  this.tileCamera.setAspectRatio(this.opts.camera.getAspectRatio());
  this.tileCamera.setNear(this.opts.camera.getNear());
  this.tileCamera.setFar(this.opts.camera.getFar());
  this.tileCamera.setPosition(this.opts.camera.getPosition());
  this.tileCamera.setTarget(this.opts.camera.getTarget());
  this.tileCamera.setUp(this.opts.camera.getUp());

  var n = this.opts.n;
  var near = this.tileCamera.getNear();
  var far = this.tileCamera.getFar();
  var fovy = this.tileCamera.getFov() / 180 * PI;
  var aspect = this.tileCamera.getAspectRatio();
  var top = tan(fovy / 2) * near;
  var bottom = -top;
  var left = -top * aspect;
  var right = -left;
  var shift_X = (right - left)/n;
  var shift_Y = (top - bottom)/n;
  var w = this.opts.viewport[2];
  var h = this.opts.viewport[3];
  var tw = w / n;
  var th = h / n;

  this.tiles = [];
  for(var i=0; i<n*n; i++) {
    var ix = i % n;
    var iy = floor(i / n);
    var x = Math.floor(ix * tw);
    var y = Math.floor(h - iy * th - th);
    this.tiles.push({
      ix: ix,
      iy: iy,
      width: w,
      height: h,
      offsetX: ix * w,
      offsetY: iy * h,
      viewport: [x, y, tw, th],
      frustum: [
        left + shift_X * ix,
        left + shift_X * (ix+1),
        bottom + shift_Y * (n - iy - 1),
        bottom + shift_Y * (n - iy),
        near, far
      ]
    })
  }
}

TileRender.prototype.getCamera = function() {
  return this.tileCamera;
}

TileRender.prototype.getViewport = function() {
  return this.viewport || this.opts.viewport;
}

TileRender.prototype.nextTile = function() {
  var tile = this.tiles[this.currentTile];
  if (!tile) {
    return false;
  }

  var n = this.opts.n;

  this.viewport = this.opts.preview ? tile.viewport : this.opts.viewport;

  var frustum = tile.frustum;

  this.tileCamera.projectionMatrix.identity();
  this.tileCamera.projectionMatrix.frustum(frustum[0], frustum[1], frustum[2], frustum[3], frustum[4], frustum[5]);

  this.currentTile++;

  return tile;
}

TileRender.prototype.capture = function() {
  var path = this.opts.path || '.';
  var gl = Context.currentContext;
  gl.writeImage('png', path + '/' + (this.currentTile-1) + '.png');

  if (this.currentTile == this.tiles.length) {
    var g = gm();
    this.tiles.forEach(function(tile, tileIndex) {
      g = g
        .in('-page', '+' + tile.offsetX + '+' + tile.offsetY)
        .in('tiles/' + tileIndex + '.png')
    })
    g = g
      .mosaic()  // Merges the images as a matrix
      .write(path + '/output.png', function (err) {
          if (err) console.log(err);
      });
  }
}

module.exports = TileRender;