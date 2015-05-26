var glu = require('pex-glu');
var gen = require('pex-gen');
var geom = require('pex-geom');

var Mesh = glu.Mesh;
var Vec3 = geom.Vec3;

function AnimatedMesh(g, material, options) {
  options = options || {};
  Mesh.call(this, g, material, options);

  this.skeleton = options.skeleton;
  this.skeletonAnimation = options.skeletonAnimation;
}

AnimatedMesh.prototype = Object.create(Mesh.prototype);

AnimatedMesh.prototype.update = function(time) {
  if (this.skeletonAnimation) {
    this.skeletonAnimation.update(time);
    this.skeletonAnimation.apply(this);
  }
}

module.exports = AnimatedMesh;