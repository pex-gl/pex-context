var CameraAbstract = require('./CameraAbstract'),
    Window_ = require('../app/Window'),
    Vec3 = require('../math/Vec3'),
    glu = require('./glu');

var DEFAULT_FOV  = 60.0,
    DEFAULT_NEAR = 0.0001,
    DEFAULT_FAR  = 10.0;

function CameraPersp(fov,windowAspectRatio,near,far) {
    CameraAbstract.call(this);

    fov = fov === undefined ? DEFAULT_FOV : fov;
    windowAspectRatio = windowAspectRatio === undefined ? Window_.get().getAspectRatio() : windowAspectRatio;
    near = near === undefined ? DEFAULT_NEAR : near;
    far  = far === undefined ? DEFAULT_FAR : far;

    this.setPerspective(fov, windowAspectRatio, near, far);
    this.setEye(Vec3.one());
    this.updateViewMatrix();
}

CameraPersp.prototype = Object.create(CameraAbstract.prototype);
CameraPersp.prototype.constructor = CameraPersp;

CameraPersp.prototype.setPerspective = function (fov, windowAspectRatio, near, far) {
    this._fov  = fov;
    this._near = near;
    this._far  = far;
    this._aspectRatio = windowAspectRatio;
    this._projectionMatrixDirty = true;
    this.updateProjectionMatrix();
};

CameraPersp.prototype.setDistance = function(dist){
    this._eye.sub(this._target).normalize().scale(dist);
    this._viewMatrixDirty = true;
};

CameraPersp.prototype.updateViewMatrix = function () {
    if (!this._viewMatrixDirty){
        return;
    }
    var eye, target, up;

    eye    = this._eye;
    target = this._target;
    up     = this._up;

    glu.lookAt(this.viewMatrix.m, eye.x, eye.y, eye.z, target.x, target.y, target.z, up.x, up.y, up.z);

    this._updateOnB();
    this._viewMatrixDirty = false;
};


CameraPersp.prototype.updateProjectionMatrix = function () {
    if (!this._projectionMatrixDirty){
        return;
    }
    var aspectRatio, fov, near, far;
    var fov_2;
    var frustumTop, frustumRight;
    var f, nf, m;

    aspectRatio = this._aspectRatio;
    fov  = this._fov;
    near = this._near;
    far  = this._far;

    fov_2 = Math.tan(fov * Math.PI / 180 * 0.5);

    frustumTop = this._frustumTop = near * fov_2;
    frustumRight = this._frustumRight = frustumTop * aspectRatio;

    this._frustumBottom = frustumTop * -1;
    this._frustumLeft   = frustumRight * -1;

    f  = 1.0 / fov_2;
    nf = 1.0 / (near - far);
    m  = this.projectionMatrix.m;

    m[ 1] = m[ 2] = m[ 3] = m[ 4] = m[ 6] = m[ 7] = m[ 8] = m[ 9] = m[12] = m[13] = m[15] = 0;

    m[ 0] = f / aspectRatio;
    m[ 5] = f;
    m[10] = (far + near) * nf;
    m[11] = -1;
    m[14] = (2 * far * near) * nf;

    this._projectionMatrixDirty = false;
};

CameraPersp.prototype.setAspectRatio = function (aspectRatio) {
    this._aspectRatio = aspectRatio;
    this._projectionMatrixDirty = true;
};

module.exports = CameraPersp;


