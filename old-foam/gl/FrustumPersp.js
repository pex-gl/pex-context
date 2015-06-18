var Frustum = require('./Frustum');
var Vec3 = require('../math/Vec3');

function FrustumPersp() {
    Frustum.call(this);
}

FrustumPersp.prototype = Object.create(Frustum.prototype);
FrustumPersp.prototype.constructor = FrustumPersp;

FrustumPersp.prototype.set = function(camera, frustumScale){
    frustumScale = frustumScale || 1.0;

    var eye = camera.getEye(this._eye);
    var frustum = camera.getFrustum(this._frustumCamera);

    var frustumLeft = frustum[2] * frustumScale,
        frustumTop = frustum[1] * frustumScale,
        frustumRight = frustum[0] * frustumScale,
        frustumBottom = frustum[3] * frustumScale,
        frustumNear = frustum[4] * frustumScale,
        frustumFar = frustum[5] * frustumScale;

    var n = this._near,
        f = this._far;

    var ntl = n[0],
        ntr = n[1],
        nbr = n[2],
        nbl = n[3];
    var ftl = f[0],
        ftr = f[1],
        fbr = f[2],
        fbl = f[3];

    var u = camera.getU(),
        v = camera.getV(),
        w = camera.getW();

   var frustumNearW = w.scaled(frustumNear),
       frustumFarW = w.scale(frustumFar),
       frustumTopV  = v.scaled(frustumTop),
       frustumBottomV = v.scaled(frustumBottom),
       frustumLeftU = u.scaled(frustumLeft),
       frustumRightU = u.scaled(frustumRight);

    ntl.set(eye).add(frustumNearW).add(frustumTopV).add(frustumLeftU);
    ntr.set(eye).add(frustumNearW).add(frustumTopV).add(frustumRightU);
    nbr.set(eye).add(frustumNearW).add(frustumBottomV).add(frustumRightU);
    nbl.set(eye).add(frustumNearW).add(frustumBottomV).add(frustumLeftU);

    var ratio = frustumFar / frustumNear;

    frustumTopV.scale(ratio);
    frustumBottomV.scale(ratio);
    frustumLeftU.scale(ratio);
    frustumRightU.scale(ratio);

    ftl.set(eye).add(frustumFarW).add(frustumTopV).add(frustumLeftU);
    ftr.set(eye).add(frustumFarW).add(frustumTopV).add(frustumRightU);
    fbr.set(eye).add(frustumFarW).add(frustumBottomV).add(frustumRightU);
    fbl.set(eye).add(frustumFarW).add(frustumBottomV).add(frustumLeftU);
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


module.exports = FrustumPersp;