var Window = require('../sys/Window');
var glu = require('./glu');

//implement cool camera here

var DEFAULT_FOV  = 45.0;
var DEFAULT_NEAR = 0.001;
var DEFAULT_FAR  = 10.0;

function PerspectiveCamera(fov,aspectRatio,near,far){
    this._eye = [0, 0, 0];
    this._target = [0, 0, 0];
    this._up = [0, 1, 0];

    this._fov = fov === undefined ? DEFAULT_FOV : fov;
    this._near = near === undefined ? DEFAULT_NEAR : near;
    this._far = far === undefined ? DEFAULT_FAR : far;
    this._aspect = aspectRatio === undefined ? Window.getCurrent().getAspectRatio() : aspectRatio;

    this._projectionMatrix = new Float32Array(16);
    this._projectionMatrixDirty = true;

    this._viewMatrix = new Float32Array(16);
    this._viewMatrixDirty = true;

    this.updateMatrices();
}

PerspectiveCamera.prototype.lookAt = function(from,to){
    switch(arguments.length){
        case 2:
            this.lookAt3(from[0],from[1],from[2],to[0],to[1],to[2]);
            break;
        case 1:
            to = arguments[0];
            this.lookAt3(to[0],to[1],to[2]);
            break;
        default:
            throw new Error('Wrong number of arguments passed.');
    }
};

PerspectiveCamera.prototype.lookAt3 = function(fromx,fromy,fromz,tox,toy,toz){
    switch(arguments.length){
        case 6:
            this._eye[0] = fromx;
            this._eye[1] = fromy;
            this._eye[2] = fromz;
            this._target[0] = tox;
            this._target[1] = toy;
            this._target[2] = toz;
            break;
        case 3:
            this._target[0] = arguments[0];
            this._target[1] = arguments[1];
            this._target[2] = arguments[2];
            break;
        default:
            throw new Error('Wrong number of arguments.');
    }

    this._viewMatrixDirty = true;
    this.updateMatrices();
};

PerspectiveCamera.prototype.setEye3 = function(x,y,z){
    this._eye[0] = x;
    this._eye[1] = y;
    this._eye[2] = z;
    this._viewMatrixDirty = true;
};

PerspectiveCamera.prototype.setTarget3 = function(x,y,z){
    this._target[0] = x;
    this._target[1] = y;
    this._target[2] = z;
    this._viewMatrixDirty = true;
};

PerspectiveCamera.prototype.getEye = function(out){
    out = out || new Array(3);
    out[0] = this._eye[0];
    out[1] = this._eye[1];
    out[2] = this._eye[2];
    return out;
};

PerspectiveCamera.prototype.getTarget = function(out){
    out = out || new Array(3);
    out[0] = this._target[0];
    out[1] = this._target[1];
    out[2] = this._target[2];
    return out;
};

PerspectiveCamera.prototype.setNear = function(near){
    this._near = near;
    this._projectionMatrixDirty = true;
};

PerspectiveCamera.prototype.setFar = function(far){
    this._far = far;
    this._projectionMatrixDirty = true;
};

PerspectiveCamera.prototype.updateMatrices = function(){
    if(!this._viewMatrixDirty && !this._projectionMatrixDirty){
        return;
    }
    if(this._viewMatrixDirty){
        glu.lookAt(this._viewMatrix,
            this._eye[0],
            this._eye[1],
            this._eye[2],
            this._target[0],
            this._target[1],
            this._target[2],
            this._up[0],
            this._up[1],
            this._up[2]
        );
        this._viewMatrixDirty = false;
    }
    if(this._projectionMatrixDirty){
        glu.perspective(this._projectionMatrix,
            this._fov,
            this._aspect,
            this._near,
            this._far
        );
        this._projectionMatrixDirty = false;
    }
};

PerspectiveCamera.prototype.getProjectionMatrix= function(){
    return this._projectionMatrix;
};

PerspectiveCamera.prototype.getViewMatrix = function(){
    return this._viewMatrix;
};

module.exports = PerspectiveCamera;
