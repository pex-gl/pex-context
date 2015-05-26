define([
  "hem/HEMesh",
  "hem/HEVertex",
  "hem/HEEdge",
  "hem/HEFace",
  "pex/core/Vec3"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {

  function Spherize() {
  }

  HEMesh.prototype.spherize = function(center, radius) {
    center = center || new Vec3(0,0,0);
    radius = radius || 1.0;
    this.vertices.forEach(function(v) {
      v.sub(center).normalize().scale(radius).add(center);
    });

    return this;
  };

  return Spherize;
});
