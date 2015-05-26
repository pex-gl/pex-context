var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Quat = geom.Quat;
var Plane = geom.Plane;

function Arcball(window, camera, distance) {
  this.camera = camera;
  this.window = window;
  this.radius = Math.min(window.width / 2, window.height / 2) * 2;
  this.center = Vec2.create(window.width / 2, window.height / 2);
  this.currRot = Quat.create();
  this.currRot.setAxisAngle(Vec3.create(0, 1, 0), 0);
  this.clickRot = Quat.create();
  this.dragRot = Quat.create();
  this.clickPos = Vec3.create();
  this.clickPosWindow = Vec2.create();
  this.dragPos = Vec3.create();
  this.dragPosWindow = Vec2.create();
  this.rotAxis = Vec3.create();
  this.allowZooming = true;
  this.enabled = true;
  this.clickTarget = Vec3.create(0, 0, 0);
  this.setDistance(distance || 2);
  this.updateCamera();
  this.addEventHanlders();
}

Arcball.prototype.setTarget = function(target) {
  this.camera.setTarget(target);
  return this.updateCamera();
};

Arcball.prototype.setOrientation = function(dir) {
  this.currRot.setDirection(dir);
  this.currRot.w *= -1;
  this.updateCamera();
  return this;
};

Arcball.prototype.setPosition = function(pos) {
  var dir = Vec3.create().asSub(pos, this.camera.getTarget());
  this.setOrientation(dir.dup().normalize());
  this.setDistance(dir.length());
  this.updateCamera();
};

Arcball.prototype.addEventHanlders = function() {
  this.window.on('leftMouseDown', function(e) {
    if (e.handled || !this.enabled) {
      return;
    }
    this.down(e.x, e.y, e.shift);
  }.bind(this));

  this.window.on('leftMouseUp', function(e) {
    this.up(e.x, e.y, e.shift);
  }.bind(this));

  this.window.on('mouseDragged', function(e) {
    if (e.handled || !this.enabled) {
      return;
    }
    this.drag(e.x, e.y, e.shift);
  }.bind(this));
  return this.window.on('scrollWheel', function(e) {
    if (e.handled || !this.enabled) {
      return;
    }
    if (!this.allowZooming) {
      return;
    }
    this.distance = Math.min(this.maxDistance, Math.max(this.distance + e.dy / 100 * (this.maxDistance - this.minDistance), this.minDistance));
    this.updateCamera();
  }.bind(this));
};

Arcball.prototype.mouseToSphere = function(x, y) {
  y = this.window.height - y;
  var v = Vec3.create((x - this.center.x) / this.radius, (y - this.center.y) / this.radius, 0);
  var dist = v.x * v.x + v.y * v.y;
  if (dist > 1) {
    v.normalize();
  }
  else {
    v.z = Math.sqrt(1.0 - dist);
  }
  return v;
};

Arcball.prototype.down = function(x, y, shift) {
  this.dragging = true;
  this.clickPos = this.mouseToSphere(x, y);
  this.clickRot.copy(this.currRot);
  this.updateCamera();
  if (shift) {
    this.clickPosWindow.set(x, y);
    var target = this.camera.getTarget();
    this.clickTarget = target.dup();
    var targetInViewSpace = target.dup().transformMat4(this.camera.getViewMatrix());
    this.panPlane = new Plane(targetInViewSpace, new Vec3(0, 0, 1));
    this.clickPosPlane = this.panPlane.intersectRay(this.camera.getViewRay(this.clickPosWindow.x, this.clickPosWindow.y, this.window.width, this.window.height));
    this.dragPosPlane = this.panPlane.intersectRay(this.camera.getViewRay(this.dragPosWindow.x, this.dragPosWindow.y, this.window.width, this.window.height));
  }
  else {
    this.panPlane = null;
  }
};

Arcball.prototype.up = function(x, y, shift) {
  this.dragging = false;
  this.panPlane = null;
};

Arcball.prototype.drag = function(x, y, shift) {
  var invViewMatrix, theta;
  if (!this.dragging) {
    return;
  }
  if (shift && this.panPlane) {
    this.dragPosWindow.set(x, y);
    this.clickPosPlane = this.panPlane.intersectRay(this.camera.getViewRay(this.clickPosWindow.x, this.clickPosWindow.y, this.window.width, this.window.height));
    this.dragPosPlane = this.panPlane.intersectRay(this.camera.getViewRay(this.dragPosWindow.x, this.dragPosWindow.y, this.window.width, this.window.height));
    invViewMatrix = this.camera.getViewMatrix().dup().invert();
    this.clickPosWorld = this.clickPosPlane.dup().transformMat4(invViewMatrix);
    this.dragPosWorld = this.dragPosPlane.dup().transformMat4(invViewMatrix);
    this.diffWorld = this.dragPosWorld.dup().sub(this.clickPosWorld);
    this.camera.setTarget(this.clickTarget.dup().sub(this.diffWorld));
    this.updateCamera();
  }
  else {
    this.dragPos = this.mouseToSphere(x, y);
    this.rotAxis.asCross(this.clickPos, this.dragPos);
    theta = this.clickPos.dot(this.dragPos);
    this.dragRot.set(this.rotAxis.x, this.rotAxis.y, this.rotAxis.z, theta);
    this.currRot.asMul(this.dragRot, this.clickRot);
  }
  this.updateCamera();
};

Arcball.prototype.updateCamera = function() {
  var q = this.currRot.clone();
  q.w *= -1;
  var target = this.camera.getTarget();
  var offset = Vec3.create(0, 0, this.distance).transformQuat(q);
  var eye = Vec3.create().asAdd(target, offset);
  var up = Vec3.create(0, 1, 0).transformQuat(q);
  this.camera.lookAt(target, eye, up);
};

Arcball.prototype.disableZoom = function() {
  this.allowZooming = false;
};

Arcball.prototype.setDistance = function(distance) {
  this.distance = distance || 2;
  this.minDistance = distance / 2 || 0.3;
  this.maxDistance = distance * 2 || 5;
  this.updateCamera();
};

module.exports = Arcball;