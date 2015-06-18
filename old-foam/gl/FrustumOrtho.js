var Frustum = require('./Frustum');
var Vec3 = require('../math/Vec3');

function FrustumOrtho(){
    Frustum.call(this);
}

FrustumOrtho.prototype = Object.create(Frustum.prototype);
FrustumOrtho.prototype.constructor = FrustumOrtho;

FrustumOrtho.prototype.set = function(camera, frustumScale){
    frustumScale = frustumScale || 1.0;

    var eye = camera.getEye(this._eye);
    var frustum = camera.getFrustum(this._frustumCamera);

    var frustumLeft = frustum[2],
        frustumTop = frustum[1],
        frustumRight = frustum[0],
        frustumBottom = frustum[3],
        frustumNear = frustum[4] * frustumScale,
        frustumFar = frustum[5] * frustumScale;

    var frustumTemp = this._frustumTemp,
        vec3Temp = this._vec3Temp;

    var w = camera.getW(vec3Temp),
        frustumNearDir = w.scaled(frustumNear,frustumTemp[0]),
        frustumFarDir = w.scaled(frustumFar,frustumTemp[1]);

    var v = camera.getV(vec3Temp),
        frustumTopV = v.scaled(frustumTop,frustumTemp[2]),
        frustumBottomV = v.scaled(frustumBottom,frustumTemp[3]);

    var u = camera.getU(vec3Temp),
        frustumLeftU = u.scaled(frustumLeft,frustumTemp[4]),
        frustumRightU = u.scaled(frustumRight,frustumTemp[5]);

    var n = this._near, f = this._far;
    var fb = eye.added(frustumFarDir),
        nb = eye.added(frustumNearDir);

    var ftl = f[0],
        ftr = f[1],
        fbr = f[2],
        fbl = f[3];
    var ntl = n[0],
        ntr = n[1],
        nbr = n[2],
        nbl = n[3];

    ftl.set(fb).add(frustumTopV).add(frustumLeftU);
    ftr.set(fb).add(frustumTopV).add(frustumRightU);
    fbr.set(fb).add(frustumBottomV).add(frustumRightU);
    fbl.set(fb).add(frustumBottomV).add(frustumLeftU);

    ntl.set(nb).add(frustumTopV).add(frustumLeftU);
    ntr.set(nb).add(frustumTopV).add(frustumRightU);
    nbr.set(nb).add(frustumBottomV).add(frustumRightU);
    nbl.set(nb).add(frustumBottomV).add(frustumLeftU);


    /*
    this._calcPlane(0,ntr,ntl,ftl);
    this._calcPlane(1,nbl,nbr,fbr);
    this._calcPlane(2,ntl,nbl,fbl);
    this._calcPlane(3,ftr,fbr,nbr);
    this._calcPlane(4,ntl,ntr,nbr);
    this._calcPlane(5,ftr,ftl,fbl);*/

    var planes = this._planes;
    planes[0].setFromPoints(ntr,ntl,ftl);
    planes[1].setFromPoints(nbl,nbr,fbr);
    planes[2].setFromPoints(ntl,nbl,fbl);
    planes[3].setFromPoints(ftr,fbr,nbr);
    planes[4].setFromPoints(ntl,ntr,nbr);
    planes[5].setFromPoints(ftr,ftl,fbl);
};



module.exports = FrustumOrtho;