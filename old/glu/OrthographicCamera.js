var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Vec4 = geom.Vec4;
var Mat4 = geom.Mat4;
var Ray = geom.Ray;

function OrthographicCamera(x, y, width, height, near, far, position, target, up) {
  var l = x;
  var r = x + width;
  var t = y;
  var b = y + height;
  this.left = l;
  this.right = r;
  this.bottom = b;
  this.top = t;
  this.near = near || 0.1;
  this.far = far || 100;
  this.position = position || Vec3.create(0, 0, 5);
  this.target = target || Vec3.create(0, 0, 0);
  this.up = up || Vec3.create(0, 1, 0);
  this.projectionMatrix = Mat4.create();
  this.viewMatrix = Mat4.create();

  this.tmpProjected = Vec4.create();
  this.updateMatrices();
}

OrthographicCamera.prototype.getFov = function() {
  return this.fov;
};

OrthographicCamera.prototype.getAspectRatio = function() {
  return this.aspectRatio;
};

OrthographicCamera.prototype.getNear = function() {
  return this.near;
};

OrthographicCamera.prototype.getFar = function() {
  return this.far;
};

OrthographicCamera.prototype.getPosition = function() {
  return this.position;
};

OrthographicCamera.prototype.getTarget = function() {
  return this.target;
};

OrthographicCamera.prototype.getUp = function() {
  return this.up;
};

OrthographicCamera.prototype.getViewMatrix = function() {
  return this.viewMatrix;
};

OrthographicCamera.prototype.getProjectionMatrix = function() {
  return this.projectionMatrix;
};

OrthographicCamera.prototype.setFov = function(fov) {
  this.fov = fov;
  this.updateMatrices();
};

OrthographicCamera.prototype.setAspectRatio = function(ratio) {
  this.aspectRatio = ratio;
  this.updateMatrices();
};

OrthographicCamera.prototype.setFar = function(far) {
  this.far = far;
  this.updateMatrices();
};

OrthographicCamera.prototype.setNear = function(near) {
  this.near = near;
  this.updateMatrices();
};

OrthographicCamera.prototype.setPosition = function(position) {
  this.position = position;
  this.updateMatrices();
};

OrthographicCamera.prototype.setTarget = function(target) {
  this.target = target;
  this.updateMatrices();
};

OrthographicCamera.prototype.setUp = function(up) {
  this.up = up;
  this.updateMatrices();
};

OrthographicCamera.prototype.lookAt = function(target, eyePosition, up) {
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

OrthographicCamera.prototype.updateMatrices = function() {
  this.projectionMatrix.identity().ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
  this.viewMatrix.identity().lookAt(this.position, this.target, this.up);
};

OrthographicCamera.prototype.getScreenPos = function(point, windowWidth, windowHeight) {
  this.tmpProjected.set(point.x, point.y, point.z, 1.0);
  this.tmpProjected.transformMat4(this.viewMatrix);
  this.tmpProjected.transformMat4(this.projectionMatrix);
  var out = Vec2.create().set(this.tmpProjected.x, this.tmpProjected.y);
  out.x /= this.tmpProjected.w;
  out.y /= this.tmpProjected.w;
  out.x = out.x * 0.5 + 0.5;
  out.y = out.y * 0.5 + 0.5;
  out.x *= windowWidth;
  out.y *= windowHeight;
  return out;
};

OrthographicCamera.prototype.getWorldRay = function(x, y, windowWidth, windowHeight) {
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
  var wDirection = wTarget.dup().sub(wOrigin);
  return new Ray(wOrigin, wDirection);
};


module.exports = OrthographicCamera;
