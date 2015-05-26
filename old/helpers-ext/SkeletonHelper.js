var glu = require('pex-glu');
var gen = require('pex-gen');
var geom = require('pex-geom');
var materials = require('pex-materials');
var color = require('pex-color');

var Color = color.Color;
var Mesh = glu.Mesh;
var LineBuilder = gen.LineBuilder;
var SolidColor = materials.SolidColor;
var Vec3 = geom.Vec3;

function SkeletonHelper(skeleton, options) {
  options = options || { showJoints: true };
  this.showJoints = options.showJoints;
  this.skeleton = skeleton;
  this.lineBuilder = new LineBuilder();
  this.lineBuilder.addLine(new Vec3(0, 0, 0), new Vec3(0, 1, 0));
  this.update();
  Mesh.call(this, this.lineBuilder, new SolidColor(), { lines: true });
}

SkeletonHelper.prototype = Object.create(Mesh.prototype);

SkeletonHelper.prototype.update = function(camera) {
  this.lineBuilder.reset();

  this.skeleton.bones.forEach(function(bone) {
    if (bone.parent) {
      this.lineBuilder.addLine(bone.positionWorld, bone.parent.positionWorld);
    }
    if (this.showJoints) {
      this.lineBuilder.addCross(bone.positionWorld, 0.2);
    }
  }.bind(this));
  this.lineBuilder.vertices.dirty = true;
}

SkeletonHelper.prototype.draw = function(camera) {
  this.update();
  Mesh.prototype.draw.call(this, camera);
}

module.exports = SkeletonHelper;