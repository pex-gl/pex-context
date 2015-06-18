var CameraAbstract = require('./CameraAbstract'),
    Vec3    = require('../math/Vec3'),
    Window_ = require('../app/Window'),
    glu     = require('./glu');

var DEFAULT_NEAR = -10,
    DEFAUTL_FAR  = 10;

function CameraOrtho() {
    CameraAbstract.call(this);
    var aspectRatio = Window_.get().getAspectRatio();
    this.setOrtho(-aspectRatio,aspectRatio,-1,1,DEFAULT_NEAR,DEFAUTL_FAR);
    this.setEye(Vec3.one());
    this.updateViewMatrix();
}

CameraOrtho.prototype = Object.create(CameraAbstract.prototype);
CameraOrtho.prototype.constructor = CameraOrtho;

CameraOrtho.prototype.setOrtho = function (left, right, bottom, top, near, far) {
    this._frustumLeft = this._frustumLeftInit = left;
    this._frustumRight = this._frustumRightInit = right;
    this._frustumBottom = this._frustumBottomInit = bottom;
    this._frustumTop = this._frustumTopInit = top;
    this._near = near;
    this._far = far;
    this._projectionMatrixDirty = true;
    this.updateProjectionMatrix();
};

CameraOrtho.prototype.updateViewMatrix = function () {
    if (!this._viewMatrixDirty) {
        return;
    }
    var eye = this._eye,
        target = this._target,
        up = this._up;

    glu.lookAt(this.viewMatrix.m, eye.x, eye.y, eye.z, target.x, target.y, target.z, up.x, up.y, up.z);
    this._updateOnB();
    this._viewMatrixDirty = false;
};

CameraOrtho.prototype.updateProjectionMatrix = function () {
    if (!this._projectionMatrixDirty) {
        return;
    }
    glu.ortho(this.projectionMatrix.m, this._frustumLeft, this._frustumRight, this._frustumBottom, this._frustumTop, this._near, this._far);
    this._projectionMatrixDirty = false;
};

CameraOrtho.prototype.setDistance = function (zoom) {
    this._frustumLeft = this._frustumLeftInit * zoom;
    this._frustumRight = this._frustumRightInit * zoom;
    this._frustumBottom = this._frustumBottomInit * zoom;
    this._frustumTop = this._frustumTopInit * zoom;
    this._projectionMatrixDirty = true;
    this.updateProjectionMatrix();
};

module.exports = CameraOrtho;
