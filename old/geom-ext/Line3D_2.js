var geom = require('pex-geom');
var Vec3 = geom.Vec3;

function Line3D(a, b) {
  this.a = a;
  this.b = b;
  this.direction = Vec3.create().asSub(this.b, this.a).normalize();
}

module.exports = Line3D;