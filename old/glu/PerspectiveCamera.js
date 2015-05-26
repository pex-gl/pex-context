var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Vec4 = geom.Vec4;
var Mat4 = geom.Mat4;
var Ray = geom.Ray;
var Frustum = geom.Frustum;
var Plane = geom.Plane;


function PerspectiveCamera(fov, aspectRatio, near, far, position, target, up) {
  this.fov = fov || 60;
  this.aspectRatio = aspectRatio || 4 / 3;
  this.near = near || 0.1;
  this.far = far || 100;
  this.position = position || Vec3.create(0, 0, 5);
  this.target = target || Vec3.create(0, 0, 0);
  this.up = up || Vec3.create(0, 1, 0);
  this.projectionMatrix = Mat4.create();
  this.viewMatrix = Mat4.create();
  this.tmpProjected = new Vec4();
  this.updateMatrices();
}

PerspectiveCamera.prototype.getFov = function() {
  return this.fov;
};

PerspectiveCamera.prototype.getAspectRatio = function() {
  return this.aspectRatio;
};

PerspectiveCamera.prototype.getNear = function() {
  return this.near;
};

PerspectiveCamera.prototype.getFar = function() {
  return this.far;
};

PerspectiveCamera.prototype.getPosition = function() {
  return this.position;
};

PerspectiveCamera.prototype.getTarget = function() {
  return this.target;
};

PerspectiveCamera.prototype.getUp = function() {
  return this.up;
};

PerspectiveCamera.prototype.getViewMatrix = function() {
  return this.viewMatrix;
};

PerspectiveCamera.prototype.getProjectionMatrix = function() {
  return this.projectionMatrix;
};

PerspectiveCamera.prototype.setFov = function(fov) {
  this.fov = fov;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setAspectRatio = function(ratio) {
  this.aspectRatio = ratio;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setFar = function(far) {
  this.far = far;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setNear = function(near) {
  this.near = near;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setPosition = function(position) {
  this.position = position;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setTarget = function(target) {
  this.target = target;
  this.updateMatrices();
};

PerspectiveCamera.prototype.setUp = function(up) {
  this.up = up;
  this.updateMatrices();
};

PerspectiveCamera.prototype.lookAt = function(target, eyePosition, up) {
  if (target) {
    this.target = target;
  }
  if (eyePosition) {
    this.position = eyePosition;
  }
  if (up) {
    this.up = up;
  }
  this.updateMatrices();
};

PerspectiveCamera.prototype.updateMatrices = function() {
  this.projectionMatrix.identity().perspective(this.fov, this.aspectRatio, this.near, this.far);
  this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
};

PerspectiveCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
  this.tmpProjected.set(point.x, point.y, point.z, 1.0);
  this.tmpProjected.transformMat4(this.viewMatrix);
  this.tmpProjected.transformMat4(this.projectionMatrix);
  var out = Vec2.create().set(this.tmpProjected.x, this.tmpProjected.y);
  out.x /= this.tmpProjected.w;
  out.y /= this.tmpProjected.w;
  out.x = out.x * 0.5 + 0.5;
  out.y = 1.0 - (out.y * 0.5 + 0.5);
  out.x *= windowWidth;
  out.y *= windowHeight;
  return out;
};

PerspectiveCamera.prototype.getViewRay = function(x, y, windowWidth, windowHeight) {
  var px = (x - windowWidth / 2) / (windowWidth / 2);
  var py = -(y - windowHeight / 2) / (windowHeight / 2);
  var hNear = 2 * Math.tan(this.getFov() / 180 * Math.PI / 2) * this.getNear();
  var wNear = hNear * this.getAspectRatio();
  px *= wNear / 2;
  py *= hNear / 2;
  var vOrigin = new Vec3(0, 0, 0);
  var vTarget = new Vec3(px, py, -this.getNear());
  var vDirection = vTarget.dup().sub(vOrigin).normalize();
  return new Ray(vOrigin, vDirection);
};

PerspectiveCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
  x = (x - windowWidth / 2) / (windowWidth / 2);
  y = -(y - windowHeight / 2) / (windowHeight / 2);
  var hNear = 2 * Math.tan(this.getFov() / 180 * Math.PI / 2) * this.getNear();
  var wNear = hNear * this.getAspectRatio();
  x *= wNear / 2;
  y *= hNear / 2;
  var vOrigin = new Vec3(0, 0, 0);
  var vTarget = new Vec3(x, y, -this.getNear());
  var invViewMatrix = this.getViewMatrix().dup().invert();
  var wOrigin = vOrigin.dup().transformMat4(invViewMatrix);
  var wTarget = vTarget.dup().transformMat4(invViewMatrix);
  var wDirection = wTarget.dup().sub(wOrigin).normalize();
  return new Ray(wOrigin, wDirection);
};

PerspectiveCamera.prototype.getFrustumClippingPlanes = function() {
  var frustumNear = this.getNear();
  var frustumFar = this.getFar();
  var frustumTop = Math.tan(this.getFov() / 180 * Math.PI / 2) * frustumNear;
  var frustumRight = frustumTop * this.getAspectRatio();
  var frustumLeft = -frustumTop;
  var frustumBottom = -frustumLeft;

  var front = Vec3.create().asSub(this.getTarget(), this.getPosition()).normalize();
  var up = this.getUp().clone();
  var right = Vec3.create().asCross(front, up).normalize();

  var ntl = right.dup().scale(-frustumRight).add(up.dup().scale( frustumTop)).add(front.dup().scale(frustumNear));
  var ntr = right.dup().scale( frustumRight).add(up.dup().scale( frustumTop)).add(front.dup().scale(frustumNear));
  var nbr = right.dup().scale( frustumRight).add(up.dup().scale(-frustumTop)).add(front.dup().scale(frustumNear));
  var nbl = right.dup().scale(-frustumRight).add(up.dup().scale(-frustumTop)).add(front.dup().scale(frustumNear));

  var farNearRatio = frustumFar / frustumNear;

  var ftl = ntl.dup().scale(farNearRatio);
  var ftr = ntr.dup().scale(farNearRatio);
  var fbr = nbr.dup().scale(farNearRatio);
  var fbl = nbl.dup().scale(farNearRatio);

  ntl.add(this.position);
  ntr.add(this.position);
  nbr.add(this.position);
  nbl.add(this.position);

  ftl.add(this.position);
  ftr.add(this.position);
  fbr.add(this.position);
  fbl.add(this.position);

  var clippingPlanes = [
    Plane.fromPoints(ntr, ntl, ftl),
    Plane.fromPoints(nbl, nbr, fbr),
    Plane.fromPoints(ntl, nbl, fbl),
    Plane.fromPoints(ftr, fbr, nbr),
    Plane.fromPoints(ntl, ntr, nbr),
    Plane.fromPoints(ftr, ftl, fbl)
  ];

  return clippingPlanes;
}

PerspectiveCamera.prototype.getFrustum = function() {
  return new Frustum(this.getFrustumClippingPlanes());
}


module.exports = PerspectiveCamera;
