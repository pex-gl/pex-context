define(["pex/Pex"], function(Pex) {
  var Vec3 = Pex.Core.Vec3;
  var Face3 = Pex.Core.Face3;

  function WireframeBuiler() {
    this.vertices = [];
    this.faces = [];
  }

  WireframeBuiler.prototype.addEdge = function(start, end, thickness) {
    var forward = end.dup().sub(start).normalize();
    var up;
    if (forward.x >= forward.y && forward.x >= forward.z) {
      up = new Vec3(0, 1, 0);
    }
    else if (forward.y >= forward.x && forward.y >= forward.z) {
      up = new Vec3(1, 0, 0);
    }
    else if (forward.z >= forward.x && forward.z >= forward.y) {
      up = new Vec3(0, 1, 0);
    }

    var right = forward.dup().cross(up).normalize();
    up = right.dup().cross(forward).normalize();

    var numSides = 3;

    for(var i=0; i<numSides; i++) {
      var idx = this.vertices.length;
      var angle = (i / numSides * Math.PI * 2);
      var nextAngle = (((i + 1) % numSides) / numSides * Math.PI * 2);
      var offset = right.scaled(thickness * Math.cos(angle)).add(up.scaled(thickness * Math.sin(angle)));
      var nextOffset = right.scaled(thickness * Math.cos(nextAngle)).add(up.scaled(thickness * Math.sin(nextAngle)));
      this.vertices.push(start.added(offset));
      this.vertices.push(end.added(offset));
      this.vertices.push(end.added(nextOffset));
      this.vertices.push(start.added(nextOffset));
      this.faces.push(new Face3(idx + 0, idx + 1, idx + 2));
      this.faces.push(new Face3(idx + 0, idx + 2, idx + 3));
    }
  };

  return WireframeBuiler;
});

