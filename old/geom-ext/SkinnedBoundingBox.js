var geom = require('pex-geom');

var Vec3 = geom.Vec3;
var BoundingBox = geom.BoundingBox;

function SkinnedBoundingBox() {
}

SkinnedBoundingBox.prototype = Object.create(BoundingBox.prototype);

SkinnedBoundingBox.prototype.update = function(mesh) {
  if (!this.bottomVertices) {
    this.bottomVertices = mesh.geometry.vertices.map(function(v, vi) {
      var copy = v.dup();
      copy.index = vi;
      return copy;
    });
    this.bottomVertices.sort(function(a, b) {
      return a.y - b.y;
    })
    this.bottomVertices = this.bottomVertices.slice(0, 10);
  }
  var transformedVertices = this.bottomVertices.map(function(v) {
    var vi = v.index;
    var boneIndex1 = mesh.geometry.skinIndices[v, vi].x;
    var boneIndex2 = mesh.geometry.skinIndices[v, vi].y;
    var boneWeight1 = mesh.geometry.skinWeights[v, vi].x;
    var boneWeight2 = mesh.geometry.skinWeights[v, vi].y;
    var boneMatrix1 = mesh.skeleton.bones[boneIndex1].boneMatrix;
    var boneMatrix2 = mesh.skeleton.bones[boneIndex2].boneMatrix;

    var pos = new Vec3(0, 0, 0);
    pos.add(v.dup().transformMat4(boneMatrix1).scale(boneWeight1));
    pos.add(v.dup().transformMat4(boneMatrix2).scale(boneWeight2));
    return pos;
  });
  var boundingBox = BoundingBox.fromPoints(transformedVertices);
  this.min = boundingBox.min;
  this.max = boundingBox.max;
}

module.exports = SkinnedBoundingBox;