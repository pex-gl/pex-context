var Vec3     = require('./Vec3'),
    Matrix44 = require('./Matrix44');

/**
 * Representation of an orthonormal basis.
 * @param {Vec3} [u] - tangent
 * @param {Vec3} [v] - up
 * @param {Vec3} [w] - cotangent
 * @constructor
 */

function OnB(u,v,w){
    this.u = u || Vec3.zAxis();
    this.v = v || Vec3.yAxis();
    this.w = w || Vec3.xAxis();
}

/**
 * Sets onb from another onb.
 * @param {OnB} onb
 * @returns {OnB}
 */

OnB.prototype.set = function(onb){
    this.u.set(onb.u);
    this.v.set(onb.v);
    this.w.set(onb.w);
    return this;
};

/**
 * Sets u v w from values.
 * @param ux
 * @param uy
 * @param uz
 * @param vx
 * @param vy
 * @param vz
 * @param wx
 * @param wy
 * @param wz
 * @returns {OnB}
 */

OnB.prototype.setf = function(ux,uy,uz,vx,vy,vz,wx,wy,wz){
    this.u.setf(ux,uy,uz);
    this.v.setf(vx,vy,vz);
    this.w.setf(wx,wy,wz);
    return this;
};

/**
 * Returns a transformation matrix from the onb.
 * @param {Matrix44} [mat] - Out matrix
 * @returns {Matrix44}
 */

OnB.prototype.getMatrix = function(mat){
    if(mat){
        mat.identity();
        return Matrix44.fromOnBAxes(this.u,this.v,this.w,mat);
    }
    return Matrix44.fromOnBAxes(this.u,this.v,this.w);
};

module.exports = OnB;
