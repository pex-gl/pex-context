var ObjectUtil = require('../util/ObjectUtil'),
    Vec3 = require('./Vec3'),
    Vec4 = require('./Vec4'),
    Matrix33 = require('./Matrix33'),
    Matrix44 = require('./Matrix44'),
    Math_ = require('./Math');

var glu = require('../gl/glu');

var xAxis = Vec3.xAxis(),
    yAxis = Vec3.yAxis(),
    zAxis = Vec3.zAxis();

var TEMP0 = new Vec3(),
    TEMP1 = new Vec3(),
    TEMP2 = new Vec3();

/**
 * Quaternion representation
 * @param {Number} [w]
 * @param {Number} [x]
 * @param {Number} [y]
 * @param {Number} [z]
 * @constructor
 */

function Quat(w,x,y,z){
    this.w = ObjectUtil.isUndefined(w) ? 1.0 : w;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * Sets the quaternion to the unit quaternion.
 * @returns {Quat}
 */

Quat.prototype.identity = function(){
    this.w = 1.0;
    this.x = this.y = this.z = 0.0;
    return this;
};

/**
 * Returns a copy of the quaternion.
 * @returns {Quat}
 */

Quat.prototype.copy = function(out){
    return (out || new Quat()).setf(this.w,this.x,this.y,this.z);
};

/**
 * Returns a quaternion set from Vec4 wxyz components
 * @param {Vec4}v
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromVec4 = function(v,out){
    return (out || new Quat()).setf(v.w, v.x, v.y, v.z);
};

/**
 * Set quaternion from other quaternion.
 * @param {Quat} q
 * @returns {Quat}
 */

Quat.prototype.set = function(q){
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
};

/**
 * Set quaternion from components.
 * @param {Number} w
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @returns {Quat}
 */

Quat.prototype.setf = function(w,x,y,z){
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};

/**
 * Set quaternion from w and Vec3 xyz components.
 * @param {Number} w
 * @param {Vec3} v
 * @returns {Quat}
 */

Quat.prototype.setVec3 = function(w,v){
    this.w = w;
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Returns a quaternion set from w and Vec3 xyz components.
 * @param {Number} w
 * @param {Vec3} v
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromVec3 = function(w,v,out){
    return (out || new Quat()).setf(w, v.x, v.y, v.z);
};

/**
 * Sets the quaternion from an orthonormal basis.
 * @param {Vec3} x
 * @param {Vec3} y
 * @param {Vec3} z
 * @returns {Quat}
 */

Quat.prototype.setFromAxes = function(x,y,z){
    return this._setFromMatrixf(x.x, y.x, z.x,
                                x.y, y.y, z.y,
                                x.z, y.z, z.z);
};

/**
 * Returns a quaternion from an orthonormal basis.
 * @param {Vec3} x
 * @param {Vec3} y
 * @param {Vec3} z
 * @param {Quat} [out] - Optional out
 * @returns {Quat}
 */

Quat.fromAxes = function(x,y,z,out){
    return (out || new Quat()).setFromAxes(x,y,z);
};


/**
 * Sets the quaternion from an orthonormal basis.
 * @param xx
 * @param xy
 * @param xz
 * @param yx
 * @param yy
 * @param yz
 * @param zx
 * @param zy
 * @param zz
 * @returns {Quat}
 */

Quat.prototype.setFromAxesf = function(xx,xy,xz,yx,yy,yz,zx,zy,zz){
    return this._setFromMatrixf(xx,yx,zx,xy,yy,zy,xz,yz,zz);
};

/**
 * Returns a quaternion from an orthonormal basis.
 * @param xx
 * @param xy
 * @param xz
 * @param yx
 * @param yy
 * @param yz
 * @param zx
 * @param zy
 * @param zz
 * @param {Quat} [out] - Optional out
 * @returns {Quat}
 */

Quat.fromAxesf = function(xx,xy,xz,yx,yy,yz,zx,zy,zz,out){
    return (out || new Quat()).setFromAxesf(xx,yx,zx,xy,yy,zy,xz,yz,zz,out);
};

/**
 * Sets the quaternion from an orthonormal basis.
 * @param {OnB}onb
 * @returns {Quat}
 */

Quat.prototype.setFromOnB = function(onb){
    return this.setFromAxes(onb.u,onb.v,onb.w);
};

/**
 * Returns a quaternion from an orthonormal basis.
 * @param onb
 * @param {Quat} [out] - Optional out
 * @returns {Quat}
 */

Quat.fromOnB = function(onb,out){
    return (out || new Quat()).setFromOnB(onb);
};

/**
 * Multiplies the quaternion with another quaternion.
 * @param q
 * @returns {Quat}
 */

Quat.prototype.mult = function(q){
    var w = this.w, x = this.x, y = this.y, z = this.z;
    var qw = q.w, qx = q.x, qy = q.y, qz = q.z;
    this.w = w * qw - x * qx - y * qy - z * qz;
    this.x = w * qx + x * qw + y * qz - z * qy;
    this.y = w * qy + y * qw + z * qx - x * qz;
    this.z = w * qz + z * qw + x * qy - y * qx;
    return this;
};

/**
 * Returns a multiplied copy of the quaternion.
 * @param q
 * @param {Quat} [out] - Optional out
 * @returns {Quat}
 */

Quat.prototype.multiplied = function(q,out){
    return this.copy(out).mult(q);
};

/**
 * Returns the dot product with another quaternion.
 * @param q
 * @returns {number}
 */

Quat.prototype.dot = function(q){
    return (this.x * q.x) + (this.y * q.y) + (this.z * q.z) + (this.w * q.w);
};

Quat.prototype.length = function(){
    var w = this.w, x = this.x, y = this.y, z = this.z;
    return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Normalizes the quaternion.
 * @returns {Quat}
 */

Quat.prototype.normalize = function(){
    var len = this.length();
    if(len > Math_.EPSILON){
        len = 1.0 / len;
        this.w *= len;
        this.x *= len;
        this.y *= len;
        this.z *= len;
    }
    return this;
};

/**
 * Returns a normalized copy of the quaternion.
 * @param out
 * @returns {Quat}
 */

Quat.prototype.normalized = function(out){
    return this.copy(out).normalize();
};

Quat.prototype.scale = function(x){
    this.w *= x;
    this.x *= x;
    this.y *= x;
    this.z *= x;
    return this;
};

Quat.prototype.scaled = function(x,out){
    return this.copy(out).scale(x);
};

Quat.prototype.negate = function(){
    return this.scale(-1);
};

Quat.prototype.negated = function(out){
    return this.copy(out).negate();
};

/**
 * Sets the quaternion as a rotation from axis angle representation.
 * @param {Vec3}axis
 * @param {Number}angle
 * @returns {Quat}
 */

Quat.prototype.setFromAxisAngle = function(axis,angle){
    return this.setFromAxisAnglef(axis.x,axis.y,axis.z,angle);
};

/**
 * Returns a quaternion from an axis angle representation.
 * @param {Vec3}axis
 * @param {Number}angle
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromAxisAngle = function(axis,angle,out){
    return (out || new Quat()).setFromAxisAngle(axis,angle);
};

/**
 * Sets the quaternion as a rotation from an axis angle representation.
 * @param {Number}x - Axis x
 * @param {Number}y - Axis y
 * @param {Number}z - Axis z
 * @param {Number}angle
 * @returns {Quat}
 */

Quat.prototype.setFromAxisAnglef = function(x,y,z,angle){
    var angle_2 = angle * 0.5;
    var sin_2 = Math.sin(angle_2);
    this.w = Math.cos(angle_2);
    this.x = x * sin_2;
    this.y = y * sin_2;
    this.z = z * sin_2;
    return this.normalize();
};

/**
 * Returns a quaternion from an axis angle representation.
 * @param {Number}x - Axis x
 * @param {Number}y - Axis y
 * @param {Number}z - Axis z
 * @param {Number}angle
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */


Quat.fromAxisAnglef = function(x,y,z,angle,out){
    return (out || new Quat()).setFromAxisAnglef(x,y,z,angle);
};

/**
 * Linear interpolation towards a given target.
 * @param {Quat}target
 * @param {Number}x
 * @returns {Quat}
 */

Quat.prototype.linearInterpolateTo = function(target,x){
    var x_ = 1 - x;
    var mult = this.dot(target) < 0 ? -1 : 1;
    return this.setf(
        this.w * x_ + target.w * x * mult,
        this.x * x_ + target.x * x * mult,
        this.y * x_ + target.y * x * mult,
        this.z * x_ + target.z * x * mult
    ).normalize();
};

/***
 * Returns a linear interpolated copy towards a given target.
 * @param target
 * @param x
 * @param out
 * @param {Quat}[out] - Optional out
 */

Quat.prototype.linearInterpolatedTo = function(target,x,out){
    return this.copy(out).linearInterpolateTo(target,x);
};

/**
 * Returns a linear interpolated copy from to
 * @param from
 * @param to
 * @param x
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromLinearInterpolationTo = function(from,to,x,out){
    return from.linearInterpolatedTo(to,x,out);
};

/**
 * Interpolates the quaternion towards a given target.
 * @param {Quat}target
 * @param {Number}x
 * @returns {Quat}
 */

Quat.prototype.interpolateTo = function(target,x){
    var scale,scale_;
    var dot = this.dot(target);
    var theta = Math.acos(dot),
        sinTheta = Math.sin(theta);

    if (sinTheta > 0.001) {
        scale = Math.sin(theta * (1.0 - x)) / sinTheta;
        scale_ = Math.sin(theta * x) / sinTheta;
    } else {
        scale = 1 - x;
        scale_ = x;
    }

    var mult = dot < 0 ? -1 : 1;
    return this.setf(
        this.w * scale + target.w * scale_ * mult,
        this.x * scale + target.x * scale_ * mult,
        this.y * scale + target.y * scale_ * mult,
        this.z * scale + target.z * scale_ * mult
    ).normalize();
};

/**
 * Returns an interpolated copy towards a given target.
 * @param {Quat}target
 * @param {Number}x
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.prototype.interpolatedTo = function(target,x,out){
    return this.copy(out).interpolateTo(target,x);
};

/**
 * Returns a new quaternion from interpolation from one quaternion to another.
 * @param from
 * @param to
 * @param x
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromInterpolationTo = function(from,to,x,out){
    return from.interpolatedTo(to,x,out);
};

/**
 * Sets the quaternion from direction.
 * @param {Vec3} direction - Normalized direction
 * @param {Vec3} [up] - up vector
 */

Quat.prototype.setFromDirection = function(direction,up){
    var z = direction,
        x = (up || yAxis).crossed(direction,TEMP0).normalize(),
        y = direction.crossed(x,TEMP1).normalize();

    return this.setFromAxes(x,y,z);
};

/**
 * Returns a new quaternion from direction
 * @param {Vec3} direction - Normalized direction
 * @param up
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromDirection = function(direction,up,out){
    return (out || new Quat()).setFromDirection(direction,up);
};

/**
 * Sets a lookat rotation from a given point towards a given target.
 * @param {Vec3}from
 * @param {Vec3}to
 * @param {Vec3}[up]
 */

Quat.prototype.lookAt = function(from,to,up){
    return this.setFromDirection(to.subbed(from).normalize(),up);
};

/**
 * Returns a new Quaternion from a lookat rotation
 * @param {Vec3}from
 * @param {Vec3}to
 * @param {Vec3}[up]
 * @param {Vec3}[out]
 * @returns {Quat}
 */

Quat.fromLookAt = function(from,to,up,out){
    return (out || new Quat()).lookAt(from,to,up);
};

/**
 * Sets the quaternion from euler rotation angles.
 * @param {Number}pitch
 * @param {Number}yaw
 * @param {Number}roll
 * @returns {Quat}
 */

Quat.prototype.setFromEuler = function(pitch,yaw,roll){
    pitch *= 0.5;
    yaw   *= 0.5;
    roll  *= 0.5;

    var c1 = Math.cos(yaw),
        s1 = Math.sin(yaw),
        c2 = Math.cos(pitch),
        s2 = Math.sin(pitch),
        c3 = Math.cos(roll),
        s3 = Math.sin(roll);

    var c1c2 = c1*c2,
        s1s2 = s1*s2;

    this.w = c1c2*c3 - s1s2*s3;
    this.x = c1c2*s3 + s1s2*c3;
    this.y = s1*c2*c3 + c1*s2*s3;
    this.z = c1*s2*c3 - s1*c2*s3;
    return this;
};

/**
 * Returns axis from axis angle representation.
 * @param {Vec3}[out] - Optional out
 * @returns {Vec3}
 */

Quat.prototype.getAxis = function(out){
    var w = this.w;
    var s = 1.0 / Math.sqrt(1.0 - w * w);
    return (out || new Vec3()).setf(this.x * s,this.y * s,this.z * s);
};

/**
 * Returns angle from axis angle representation.
 * @returns {number}
 */

Quat.prototype.getAngle = function(){
    return Math.acos(this.w) * 2.0;
};

/**
 * Returns the axis angle representation.
 * @param {Vec4}[out] - Optional out
 * @returns {Vec4}
 */

Quat.prototype.getAxisAngle = function(out){
    return (out || new Vec4()).setVec3(this.getAxis(),this.getAngle());
};

/**
 * Sets the quaternion from a 3x3 rotation matrix or the upper left part of a 4x4 matrix.
 * @param m11
 * @param m12
 * @param m13
 * @param m21
 * @param m22
 * @param m23
 * @param m31
 * @param m32
 * @param m33
 * @returns {Quat}
 * @private
 */

Quat.prototype._setFromMatrixf = function(m11,m12,m13,
                                          m21,m22,m23,
                                          m31,m32,m33){
    var trace = m11 + m22 + m33,s;

    if(trace >= 0){
        s = Math.sqrt(trace + 1);
        this.w = 0.5 * s;
        s = 0.5 / s;
        this.x = (m32 - m23) * s;
        this.y = (m13 - m31) * s;
        this.z = (m21 - m12) * s;

    } else if ((m11 > m22) && (m11 > m33)) {
        s = Math.sqrt(1.0 + m11 - m22 - m33);
        this.x = s * 0.5;
        s = 0.5 / s;
        this.y = (m21 + m12) * s;
        this.z = (m13 + m31) * s;
        this.w = (m32 - m23) * s;

    } else if (m22 > m33) {
        s = Math.sqrt(1.0 + m22 - m11 - m33);
        this.y = s * 0.5;
        s = 0.5 / s;
        this.x = (m21 + m12) * s;
        this.z = (m32 + m23) * s;
        this.w = (m13 - m31) * s;

    } else {
        s = Math.sqrt(1.0 + m33 - m11 - m22);
        this.z = s * 0.5;
        s = 0.5 / s;
        this.x = (m13 + m31) * s;
        this.y = (m32 + m23) * s;
        this.w = (m21 - m12) * s;
    }
    return this;
};

/**
 * Sets the quaternion from a 4x4 rotation matrix.
 * @param matrix
 * @returns {Quat}
 */

Quat.prototype.setFromMatrix44 = function(matrix){
    //matrix = matrix.transposed();
    var m = matrix.m;
    return this._setFromMatrixf(m[0],m[1],m[2],
                                m[4],m[5],m[6],
                                m[8],m[9],m[10]);



};

/**
 * Returns a quaternion from a rotation 4x4 rotation matrix.
 * @param {Matrix44} matrix
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromMatrix44 = function(matrix,out){
    return (out || new Quat()).setFromMatrix44(matrix);
};

/**
 * Returns a 4x4 rotation matrix from the normalized quaternion.
 * @param {Matrix44}[out] - Optional out
 * @returns {Matrix44}
 */

Quat.prototype.toMatrix44 = function(out){
    out = out || new Matrix44();
    var m = out.m;
    var x = this.x, y = this.y, z = this.z, w = this.w;

    var x2 = x + x,
        y2 = y + y,
        z2 = z + z;

    var xx = x * x2,
        xy = x * y2,
        xz = x * z2;

    var yy = y * y2,
        yz = y * z2,
        zz = z * z2;

    var wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    m[ 0] = 1 - ( yy + zz );
    m[ 4] = xy - wz;
    m[ 8] = xz + wy;

    m[ 1] = xy + wz;
    m[ 5] = 1 - ( xx + zz );
    m[ 9] = yz - wx;

    m[ 2] = xz - wy;
    m[ 6] = yz + wx;
    m[10] = 1 - ( xx + yy );

    m[ 3] = m[ 7] = m[11] = m[12] = m[13] = m[14] = 0;
    m[15] = 1;

    return out;
};

/**
 * Returns the inverse 4x4 rotation matrix from the normalized quaternion.
 * @returns {Matrix44}
 */

Quat.prototype.toMatrix44Inverted = function(){
    return this.toMatrix44().invert();
};

/**
 * Returns a 3x3 rotation matrix from the normalized quaternion.
 * @param {Matrix33}[out] - Optional out
 * @returns {Matrix33}
 */

Quat.prototype.toMatrix33 = function(out){
    out = out || new Matrix44();
    var m = out.m;
    var x = this.x, y = this.y, z = this.z, w = this.w;

    var x2 = x + x,
        y2 = y + y,
        z2 = z + z;

    var xx = x * x2,
        xy = x * y2,
        xz = x * z2;

    var yy = y * y2,
        yz = y * z2,
        zz = z * z2;

    var wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    m[ 0] = 1 - ( yy + zz );
    m[ 3] = xy - wz;
    m[ 6] = xz + wy;

    m[ 1] = xy + wz;
    m[ 4] = 1 - ( xx + zz );
    m[ 7] = yz - wx;

    m[ 2] = xz - wy;
    m[ 5] = yz + wx;
    m[ 8] = 1 - ( xx + yy );

    return out;
};


/**
 * Sets the quaternion from a 3x3 rotation matrix.
 * @param matrix
 * @returns {Quat}
 */


Quat.prototype.setFromMatrix33 = function(matrix){
    var m = matrix.m;
    return this._setFromMatrixf(m[0],m[1],m[2],
                                m[3],m[4],m[5],
                                m[6],m[7],m[8]);
};

/**
 * Returns a quaternion from a 3x3 rotation matrix.
 * @param {Matrix33} matrix
 * @param {Quat}[out] - Optional out
 * @returns {Quat}
 */

Quat.fromMatrix33 = function(matrix,out){
    return (out || new Quat()).setFromMatrix33(matrix);
};

/**
 * Returns a string representation of the quaternion.
 * @returns {string}
 */

Quat.prototype.toString = function(){
    return '[' + this.w + ',' + this.x + ',' + this.y + ',' + this.z + ']';
};

module.exports = Quat;