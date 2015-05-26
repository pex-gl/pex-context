define([], function() {
  function Line3D(point, direction) {
    this.point = point;
    this.direction = direction;
  }

  Line3D.prototype.intersectWithLine = function(line) {
    //a(V1 x V2) = (P2-P1) x V2
    var directionCross = this.direction.dup().cross(line.direction);
    var diffCross = line.point.subbed(this.point).cross(line.direction);
    var a;
    if (directionCross.x !== 0) a = diffCross.x / directionCross.x;
    else if (directionCross.y !== 0) a = diffCross.y / directionCross.y;
    else if (directionCross.z !== 0) a = diffCross.z / directionCross.z;
    return this.point.added(this.direction.scaled(a));
  };

  return Line3D;
});