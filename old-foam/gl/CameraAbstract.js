var Vec3       = require('../math/Vec3'),
    Matrix44   = require('../math/Matrix44'),
    ObjectUtil = require('../util/ObjectUtil');

var Color = require('../util/Color');

var glDraw, _glDraw = require('./glDraw');
var glTrans = require('./glTrans');

function CameraAbstract() {
    glDraw = _glDraw.get();

    this._eye = new Vec3();
    this._target = new Vec3();
    this._up = Vec3.yAxis();

    this._fov = 0;
    this._near = 0;
    this._far = 0;

    this._u = new Vec3();
    this._v = new Vec3();
    this._w = new Vec3();


    this._frustumLeft = this._frustumRight = this._frustumBottom = this._frustumTop = 0;

    this._viewMatrixDirty = true;
    this._projectionMatrixDirty = true;

    this.projectionMatrix = new Matrix44();
    this.viewMatrix = new Matrix44();
}

CameraAbstract.prototype._updateOnB = function(){
    var up = this._up;
    var eye = this._eye, target = this._target;
    var u = this._u, v = this._v, w = this._w;
    target.subbed(eye,w).normalize();
    up.crossed(w, u).normalize();
    w.crossed(u, v).normalize();

    if(eye.x == target.x && eye.z == target.z){
        if(eye.y > target.y){
            u.setf(0,0,1);
            v.setf(1,0,0);
            w.setf(0,-1,0);
        } else {
            u.setf(1,0,0);
            v.setf(0,0,1);
            w.setf(0,1,0);
        }
    }
};


CameraAbstract.prototype.setTarget = function (v) {
    this.setTarget3f(v.x, v.y, v.z);
};

CameraAbstract.prototype.setTarget3f = function (x, y, z) {
    this._target.setf(x, y, z);
    this._viewMatrixDirty = false;
};

CameraAbstract.prototype.getTarget = function(v){
    return this._target.copy(v);
};

CameraAbstract.prototype.setEye = function (v) {
    this.setEye3f(v.x, v.y, v.z);
};

CameraAbstract.prototype.setEye3f = function (x, y, z) {
    this._eye.setf(x,y,z);
    this._viewMatrixDirty = true;
};

CameraAbstract.prototype.getEye = function(v){
    return this._eye.copy(v);
};

CameraAbstract.prototype.lookAt = function(eye,target,up){
    this._eye.set(eye);
    this._target.set(target);
    this._up.set(up || this._up);
    this._viewMatrixDirty = true;
};

var temp0 = new Vec3();

CameraAbstract.prototype.getDistance = function(){
    return this._eye.subbed(this._target,temp0).length();
};

CameraAbstract.prototype.setUp = function (v) {
    this._up.set(v);
    this._viewMatrixDirty = true;
};

CameraAbstract.prototype.setUp3f = function (x, y, z) {
    this._up.setf(x,y,z);
    this._viewMatrixDirty = true;
};

CameraAbstract.prototype.setNear = function (near) {
    this._near = near;
    this._projectionMatrixDirty = true;
};

CameraAbstract.prototype.getNear = function(){
    return this._near;
};

CameraAbstract.prototype.setFar = function (far) {
    this._far = far;
    this._projectionMatrixDirty = true;
};

CameraAbstract.prototype.getFar = function(){
    return this._far;
};

CameraAbstract.prototype.setFov = function (fov) {
    this._fov = fov;
    this._projectionMatrixDirty = true;
};

CameraAbstract.prototype.getFov = function(){
    return this._fov;
}


CameraAbstract.prototype.updateMatrices = function () {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
};


CameraAbstract.prototype.getFrustum = function(frustum){
    frustum = frustum || new Array(6);

    frustum[0] = this._frustumLeft;
    frustum[1] = this._frustumTop;
    frustum[2] = this._frustumRight;
    frustum[3] = this._frustumBottom;
    frustum[4] = this._near;
    frustum[5] = this._far;

    return frustum;
};

CameraAbstract.prototype.getU = function(v) {
    return (v || new Vec3()).set(this._u);
};

CameraAbstract.prototype.getV = function(v){
    return (v || new Vec3()).set(this._v);
};

CameraAbstract.prototype.getW = function(v){
    return (v || new Vec3()).set(this._w);
};

// draw orthonormal frame

CameraAbstract.prototype.draw = function(){
    var trans = Matrix44.fromOnBAxes(this._w,this._v,this._u);
    var color = glDraw.getColor();

    glTrans.pushMatrix();
    glTrans.translate(this._eye);
    glTrans.multMatrix(trans);
    glDraw.drawPivot();
    glTrans.scale3f(0.25,0.125,0.125);
    glDraw.color(Color.white());
    glDraw.drawCubeStroked();
    glTrans.popMatrix();

    glDraw.color(color);
};

module.exports = CameraAbstract;
