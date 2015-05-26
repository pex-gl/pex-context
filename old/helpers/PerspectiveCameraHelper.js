var glu = require('pex-glu');
var gen = require('pex-gen');
var geom = require('pex-geom');
var materials = require('pex-materials');
var color = require('pex-color');

var Color = color.Color;
var Mesh = glu.Mesh;
var LineBuilder = gen.LineBuilder;
var ShowColors = materials.ShowColors;
var Vec3 = geom.Vec3;

function PerspectiveCameraHelper(camera, options) {
  options = options || { };
  this.camera = camera;
  this.lineBuilder = new LineBuilder();

  this.update();
  Mesh.call(this, this.lineBuilder, new ShowColors(), { lines: true });
}

PerspectiveCameraHelper.prototype = Object.create(Mesh.prototype);

PerspectiveCameraHelper.prototype.update = function() {
  var camera = this.camera;
  this.lineBuilder.reset();

  var position = camera.getPosition();
  var target = camera.getTarget();

  var frustumNear = camera.getNear();
  var frustumFar = camera.getFar();
  var frustumTop = Math.tan(camera.getFov() / 180 * Math.PI / 2) * frustumNear;
  var frustumRight = frustumTop * camera.getAspectRatio();
  var frustumLeft = -frustumTop;
  var frustumBottom = -frustumLeft;

  var front = Vec3.create().asSub(camera.getTarget(), camera.getPosition()).normalize();
  var up = camera.getUp().clone();
  var right = Vec3.create().asCross(front, up).normalize();

  var frustumNearTopLeft     = right.dup().scale(-frustumRight).add(up.dup().scale( frustumTop)).add(front.dup().scale(frustumNear));
  var frustumNearTopRight    = right.dup().scale( frustumRight).add(up.dup().scale( frustumTop)).add(front.dup().scale(frustumNear));
  var frustumNearBottomRight = right.dup().scale( frustumRight).add(up.dup().scale(-frustumTop)).add(front.dup().scale(frustumNear));
  var frustumNearBottomLeft  = right.dup().scale(-frustumRight).add(up.dup().scale(-frustumTop)).add(front.dup().scale(frustumNear));

  var farNearRatio = frustumFar / frustumNear;

  var frustumFarTopLeft     = frustumNearTopLeft.dup().scale(farNearRatio);
  var frustumFarTopRight    = frustumNearTopRight.dup().scale(farNearRatio);
  var frustumFarBottomRight = frustumNearBottomRight.dup().scale(farNearRatio);
  var frustumFarBottomLeft  = frustumNearBottomLeft.dup().scale(farNearRatio);

  this.lineBuilder.addLine(position, position.dup().add(frustumFarTopLeft), Color.White);
  this.lineBuilder.addLine(position, position.dup().add(frustumFarTopRight), Color.White);
  this.lineBuilder.addLine(position, position.dup().add(frustumFarBottomRight), Color.White);
  this.lineBuilder.addLine(position, position.dup().add(frustumFarBottomLeft), Color.White);

  this.lineBuilder.addLine(position.dup().add(frustumNearTopLeft), position.dup().add(frustumNearTopRight), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumNearTopRight), position.dup().add(frustumNearBottomRight), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumNearBottomRight), position.dup().add(frustumNearBottomLeft), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumNearBottomLeft), position.dup().add(frustumNearTopLeft), Color.White);

  this.lineBuilder.addLine(position.dup().add(frustumFarTopLeft), position.dup().add(frustumFarTopRight), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumFarTopRight), position.dup().add(frustumFarBottomRight), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumFarBottomRight), position.dup().add(frustumFarBottomLeft), Color.White);
  this.lineBuilder.addLine(position.dup().add(frustumFarBottomLeft), position.dup().add(frustumFarTopLeft), Color.White);

  this.lineBuilder.addLine(camera.getPosition(), camera.getPosition().dup().add(right), Color.Red);
  this.lineBuilder.addLine(camera.getPosition(), camera.getPosition().dup().add(up), Color.Green);
  this.lineBuilder.addLine(camera.getPosition(), camera.getPosition().dup().add(front), Color.Blue);
}

PerspectiveCameraHelper.prototype.draw = function(camera) {
  this.update(camera);
  Mesh.prototype.draw.call(this, camera);
}

module.exports = PerspectiveCameraHelper;