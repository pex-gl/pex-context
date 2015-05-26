var geom = require('pex-geom');
var Vec3 = geom.Vec3;

var EPSYLON = 0.0001;

function Plane(point, normal) {
  this.point = point;
  this.normal = normal;
}

Plane.prototype.intersectSegment = function(line) {
  var d, hitPoint, lDotN, plDotN;
  plDotN = Vec3.create().asSub(this.point, line.a).dot(this.normal);
  lDotN = line.direction.dot(this.normal);
  if (Math.abs(lDotN) < EPSYLON) {
    return null;
  }
  d = plDotN / lDotN;
  hitPoint = Vec3.create().copy(line.direction).scale(d).add(line.a);
  hitPoint.ratio = d / line.a.dup().sub(line.b).length();
  return hitPoint;
};

Plane.prototype.isPointAbove = function(p) {
  var pp = Vec3.create().asSub(p, this.point).normalize();
  return pp.dot(this.normal) > 0;
};

Plane.prototype.projectPoint = function(a) {
  var pa = Vec3.create().asSub(a, this.point);
  var paDotN = pa.dot(this.normal);
  return a.dup().sub(this.normal.dup().scale(paDotN));
};

Plane.prototype.distance = function(a) {
  var projectedA = this.projectPoint(a);
  return projectedA.distance(a);
}

Plane.prototype.contains = function(a) {
  return this.distance(a) < EPSYLON;
}

module.exports = Plane;