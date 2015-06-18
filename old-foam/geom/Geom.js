var Vec3 = require('../math/Vec3');

/**
 * General geometry utilities.
 * @type {{}}
 */

var Geom = {};

/**
 * @param {Number} phi - azimuthal angle phi φ
 * @param {Number} theta - polar angle theta θ
 * @param {Number} rho - radial distance rho
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

Geom.sphericalToCartesian = function(phi,theta,rho,out){
    return (out || new Vec3()).setf(
        rho * Math.sin(theta) * Math.cos(phi),
        rho * Math.cos(theta),
        rho * Math.sin(theta) * Math.sin(phi));
};

/**
 *
 * @param p
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

Geom.cartesianToSpherical = function(p,out){
    var x = p.x,
        y = p.y,
        z = p.z;
    return (out || new Vec3()).setf(
        Math.atan2(z,x), //theta
        Math.atan2(Math.sqrt(x * x + z * z),y), //phi
        p.length() //rho
        );
};

module.exports = Geom;