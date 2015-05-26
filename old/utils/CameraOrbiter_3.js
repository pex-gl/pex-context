var Vec2 = require('pex-geom').Vec2;

Vec2.prototype.setf = function(x,y){
    this.x = x;
    this.y = y;
    return this;
};

Vec2.prototype.toZero = function(){
    this.x = this.y = 0;
    return this;
};

//region CLASSES
function Vec3(x,y,z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

Vec3.prototype.set =  function(v){
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

Vec3.prototype.setf = function(x,y,z){
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};

Vec3.prototype.copy = function(v){
    return (v || new Vec3()).setf(this.x,this.y,this.z);
};


Vec3.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
};

Vec3.prototype.addf = function(x,y,z){
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
};

Vec3.prototype.scale = function(n){
    this.x *= n;
    this.y *= n;
    this.z *= n;
    return this;
};

Vec3.prototype.cross =function (v) {
    var x = this.x,
        y = this.y,
        z = this.z;
    var vx = v.x,
        vy = v.y,
        vz = v.z;

    this.x = y * vz - vy * z;
    this.y = z * vx - vz * x;
    this.z = x * vy - vx * y;
    return this;
};

Vec3.prototype.normalize = function(){
    var x = this.x,
        y = this.y,
        z = this.z;
    var l = Math.sqrt(x * x + y * y + z * z);

    if(l){
        l = 1.0 / l;
        this.x *= l;
        this.y *= l;
        this.z *= l;
    }
    return this;
};

Vec3.prototype.crossed = function(v,out){
    return this.copy(out).cross(v);
};

Vec3.xAxis = function(){
    return new Vec3(1,0,0);
};

Vec3.yAxis = function(){
    return new Vec3(0,1,0);
};

Vec3.zAxis = function(){
    return new Vec3(0,0,1);
};


var xAxis = Vec3.xAxis(),
    yAxis = Vec3.yAxis(),
    zAxis = Vec3.zAxis();

var TEMP0 = new Vec3(),
    TEMP1 = new Vec3(),
    TEMP2 = new Vec3();

function Quat(w,x,y,z){
    this.w = w == undefined ? 1.0 : w;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}


Quat.prototype.identity = function(){
    this.w = 1.0;
    this.x = this.y = this.z = 0.0;
    return this;
};


Quat.prototype.copy = function(out){
    return (out || new Quat()).setf(this.w,this.x,this.y,this.z);
};

Quat.fromVec4 = function(v,out){
    return (out || new Quat()).setf(v.w, v.x, v.y, v.z);
};

Quat.prototype.set = function(q){
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
};

Quat.prototype.setf = function(w,x,y,z){
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
};

Quat.fromVec3 = function(w,v,out){
    return (out || new Quat()).setf(w, v.x, v.y, v.z);
};

Quat.prototype.setFromAxes = function(x,y,z){
    return this._setFromMatrixf(x.x, y.x, z.x,
        x.y, y.y, z.y,
        x.z, y.z, z.z);
};

Quat.fromAxes = function(x,y,z,out){
    return (out || new Quat()).setFromAxes(x,y,z);
};

Quat.prototype.setFromAxesf = function(xx,xy,xz,yx,yy,yz,zx,zy,zz){
    return this._setFromMatrixf(xx,yx,zx,xy,yy,zy,xz,yz,zz);
};


Quat.fromAxesf = function(xx,xy,xz,yx,yy,yz,zx,zy,zz,out){
    return (out || new Quat()).setFromAxesf(xx,yx,zx,xy,yy,zy,xz,yz,zz,out);
};

Quat.prototype.mult = function(q){
    var w = this.w, x = this.x, y = this.y, z = this.z;
    var qw = q.w, qx = q.x, qy = q.y, qz = q.z;
    this.w = w * qw - x * qx - y * qy - z * qz;
    this.x = w * qx + x * qw + y * qz - z * qy;
    this.y = w * qy + y * qw + z * qx - x * qz;
    this.z = w * qz + z * qw + x * qy - y * qx;
    return this;
};


Quat.prototype.dot = function(q){
    return (this.x * q.x) + (this.y * q.y) + (this.z * q.z) + (this.w * q.w);
};

Quat.prototype.length = function(){
    var w = this.w, x = this.x, y = this.y, z = this.z;
    return Math.sqrt(x * x + y * y + z * z + w * w);
};

Quat.prototype.normalize = function(){
    var len = this.length();
    if(len > 2.2204460492503130808472633361816E-16){
        len = 1.0 / len;
        this.w *= len;
        this.x *= len;
        this.y *= len;
        this.z *= len;
    }
    return this;
};

Quat.prototype.setFromAxisAngle = function(axis,angle){
    return this.setFromAxisAnglef(axis.x,axis.y,axis.z,angle);
};

Quat.fromAxisAngle = function(axis,angle,out){
    return (out || new Quat()).setFromAxisAngle(axis,angle);
};

Quat.prototype.setFromAxisAnglef = function(x,y,z,angle){
    var angle_2 = angle * 0.5;
    var sin_2 = Math.sin(angle_2);
    this.w = Math.cos(angle_2);
    this.x = x * sin_2;
    this.y = y * sin_2;
    this.z = z * sin_2;
    return this.normalize();
};

Quat.fromAxisAnglef = function(x,y,z,angle,out){
    return (out || new Quat()).setFromAxisAnglef(x,y,z,angle);
};

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

Quat.prototype.setFromDirection = function(direction,up){
    var z = direction,
        x = (up || yAxis).crossed(direction,TEMP0).normalize(),
        y = direction.crossed(x,TEMP1).normalize();

    return this.setFromAxes(x,y,z);
};

Quat.fromDirection = function(direction,up,out){
    return (out || new Quat()).setFromDirection(direction,up);
};

Quat.prototype.lookAt = function(from,to,up){
    return this.setFromDirection(to.subbed(from).normalize(),up);
};

Quat.fromLookAt = function(from,to,up,out){
    return (out || new Quat()).lookAt(from,to,up);
};

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

Quat.prototype.setFromMatrix44 = function(matrix){
    var m = matrix.m;
    return this._setFromMatrixf(m[0],m[1],m[2],
        m[4],m[5],m[6],
        m[8],m[9],m[10]
    );
};

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

function Matrix44() {
    this.m = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 ];
}

Matrix44.prototype.set = function(matrix){
    var m = matrix.m;
    return this.setf(m[ 0],m[ 1],m[ 2],m[ 3],
        m[ 4],m[ 5],m[ 6],m[ 7],
        m[ 8],m[ 9],m[10],m[11],
        m[12],m[13],m[14],m[15]);
};

Matrix44.prototype.setf = function(m00,m01,m02,m03,
                                   m10,m11,m12,m13,
                                   m20,m21,m22,m23,
                                   m30,m31,m32,m33){
    var m = this.m;
    m[ 0] = m00;m[ 1] = m01;m[ 2] = m02;m[ 3] = m03;
    m[ 4] = m10;m[ 5] = m11;m[ 6] = m12;m[ 7] = m13;
    m[ 8] = m20;m[ 9] = m21;m[10] = m22;m[11] = m23;
    m[12] = m30;m[13] = m31;m[14] = m32;m[15] = m33;
    return this;
};

Matrix44.prototype.copy = function(out){
    return (out || new Matrix44()).set(this);
};

Matrix44.prototype.identity = function(){
    var m = this.m;
    m[ 1] = m[ 2] = m[ 3] = m[ 4] = m[ 6] = m[ 7] = m[ 8] = m[ 9] = m[11] = m[12] = m[13] = m[14] =0;
    m[ 0] = m[ 5] = m[10] = m[15] = 1;
    return this;
};

Matrix44.prototype.translatef = function(x,y,z){
    return this.multf(1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1);
};

Matrix44.prototype.multf = function(m00,m01,m02,m03,
                                    m10,m11,m12,m13,
                                    m20,m21,m22,m23,
                                    m30,m31,m32,m33){
    var m = this.m;
    var m_00 = m[ 0], m_01 = m[ 1], m_02 = m[ 2], m_03 = m[ 3],
        m_10 = m[ 4], m_11 = m[ 5], m_12 = m[ 6], m_13 = m[ 7],
        m_20 = m[ 8], m_21 = m[ 9], m_22 = m[10], m_23 = m[11],
        m_30 = m[12], m_31 = m[13], m_32 = m[14], m_33 = m[15];

    m[ 0] = (m00 * m_00) + (m01 * m_10) + (m02 * m_20) + (m03 * m_30);
    m[ 1] = (m00 * m_01) + (m01 * m_11) + (m02 * m_21) + (m03 * m_31);
    m[ 2] = (m00 * m_02) + (m01 * m_12) + (m02 * m_22) + (m03 * m_32);
    m[ 3] = (m00 * m_03) + (m01 * m_13) + (m02 * m_23) + (m03 * m_33);

    m[ 4] = (m10 * m_00) + (m11 * m_10) + (m12 * m_20) + (m13 * m_30);
    m[ 5] = (m10 * m_01) + (m11 * m_11) + (m12 * m_21) + (m13 * m_31);
    m[ 6] = (m10 * m_02) + (m11 * m_12) + (m12 * m_22) + (m13 * m_32);
    m[ 7] = (m10 * m_03) + (m11 * m_13) + (m12 * m_23) + (m13 * m_33);

    m[ 8] = (m20 * m_00) + (m21 * m_10) + (m22 * m_20) + (m23 * m_30);
    m[ 9] = (m20 * m_01) + (m21 * m_11) + (m22 * m_21) + (m23 * m_31);
    m[10] = (m20 * m_02) + (m21 * m_12) + (m22 * m_22) + (m23 * m_32);
    m[11] = (m20 * m_03) + (m21 * m_13) + (m22 * m_23) + (m23 * m_33);

    m[12] = (m30 * m_00) + (m31 * m_10) + (m32 * m_20) + (m33 * m_30);
    m[13] = (m30 * m_01) + (m31 * m_11) + (m32 * m_21) + (m33 * m_31);
    m[14] = (m30 * m_02) + (m31 * m_12) + (m32 * m_22) + (m33 * m_32);
    m[15] = (m30 * m_03) + (m31 * m_13) + (m32 * m_23) + (m33 * m_33);

    return this;
};

Matrix44.prototype.mult = function(matrix) {
    var m  = this.m,
        m_ = matrix.m;

    var m_00 = m_[ 0], m_01 = m_[ 1], m_02 = m_[ 2], m_03 = m_[ 3],
        m_10 = m_[ 4], m_11 = m_[ 5], m_12 = m_[ 6], m_13 = m_[ 7],
        m_20 = m_[ 8], m_21 = m_[ 9], m_22 = m_[10], m_23 = m_[11],
        m_30 = m_[12], m_31 = m_[13], m_32 = m_[14], m_33 = m_[15];
    var m00 = m[ 0], m01 = m[ 1], m02 = m[ 2], m03 = m[ 3],
        m10 = m[ 4], m11 = m[ 5], m12 = m[ 6], m13 = m[ 7],
        m20 = m[ 8], m21 = m[ 9], m22 = m[10], m23 = m[11],
        m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];


    m[ 0] = (m_00 * m00) + (m_01 * m10) + (m_02 * m20) + (m_03 * m30);
    m[ 1] = (m_00 * m01) + (m_01 * m11) + (m_02 * m21) + (m_03 * m31);
    m[ 2] = (m_00 * m02) + (m_01 * m12) + (m_02 * m22) + (m_03 * m32);
    m[ 3] = (m_00 * m03) + (m_01 * m13) + (m_02 * m23) + (m_03 * m33);

    m[ 4] = (m_10 * m00) + (m_11 * m10) + (m_12 * m20) + (m_13 * m30);
    m[ 5] = (m_10 * m01) + (m_11 * m11) + (m_12 * m21) + (m_13 * m31);
    m[ 6] = (m_10 * m02) + (m_11 * m12) + (m_12 * m22) + (m_13 * m32);
    m[ 7] = (m_10 * m03) + (m_11 * m13) + (m_12 * m23) + (m_13 * m33);

    m[ 8] = (m_20 * m00) + (m_21 * m10) + (m_22 * m20) + (m_23 * m30);
    m[ 9] = (m_20 * m01) + (m_21 * m11) + (m_22 * m21) + (m_23 * m31);
    m[10] = (m_20 * m02) + (m_21 * m12) + (m_22 * m22) + (m_23 * m32);
    m[11] = (m_20 * m03) + (m_21 * m13) + (m_22 * m23) + (m_23 * m33);

    m[12] = (m_30 * m00) + (m_31 * m10) + (m_32 * m20) + (m_33 * m30);
    m[13] = (m_30 * m01) + (m_31 * m11) + (m_32 * m21) + (m_33 * m31);
    m[14] = (m_30 * m02) + (m_31 * m12) + (m_32 * m22) + (m_33 * m32);
    m[15] = (m_30 * m03) + (m_31 * m13) + (m_32 * m23) + (m_33 * m33);
    return this;
};

Matrix44.prototype.invert = function() {
    var m = this.m;
    var det;
    var m00 = m[ 0], m10 = m[ 1], m20 = m[ 2], m30 = m[ 3],
        m01 = m[ 4], m11 = m[ 5], m21 = m[ 6], m31 = m[ 7],
        m02 = m[ 8], m12 = m[ 9], m22 = m[10], m32 = m[11],
        m03 = m[12], m13 = m[13], m23 = m[14], m33 = m[15];

    //TODO: add caching

    m[ 0] = m11 * m22 * m33 -
    m11 * m32 * m23 -
    m12 * m21 * m33 +
    m12 * m31 * m23 +
    m13 * m21 * m32 -
    m13 * m31 * m22;

    m[ 4] = -m01 * m22 * m33 +
    m01 * m32 * m23 +
    m02 * m21 * m33 -
    m02 * m31 * m23 -
    m03 * m21 * m32 +
    m03 * m31 * m22;

    m[ 8] = m01 * m12 * m33 -
    m01 * m32 * m13 -
    m02 * m11 * m33 +
    m02 * m31 * m13 +
    m03 * m11 * m32 -
    m03 * m31 * m12;

    m[12] = -m01 * m12 * m23 +
    m01 * m22 * m13 +
    m02 * m11 * m23 -
    m02 * m21 * m13 -
    m03 * m11 * m22 +
    m03 * m21 * m12;

    m[ 1] = -m10 * m22 * m33 +
    m10 * m32 * m23 +
    m12 * m20 * m33 -
    m12 * m30 * m23 -
    m13 * m20 * m32 +
    m13 * m30 * m22;

    m[ 5] = m00 * m22 * m33 -
    m00 * m32 * m23 -
    m02 * m20 * m33 +
    m02 * m30 * m23 +
    m03 * m20 * m32 -
    m03 * m30 * m22;

    m[ 9] = -m00 * m12 * m33 +
    m00 * m32 * m13 +
    m02 * m10 * m33 -
    m02 * m30 * m13 -
    m03 * m10 * m32 +
    m03 * m30 * m12;

    m[13] = m00 * m12 * m23 -
    m00 * m22 * m13 -
    m02 * m10 * m23 +
    m02 * m20 * m13 +
    m03 * m10 * m22 -
    m03 * m20 * m12;

    m[ 2] = m10 * m21 * m33 -
    m10 * m31 * m23 -
    m11 * m20 * m33 +
    m11 * m30 * m23 +
    m13 * m20 * m31 -
    m13 * m30 * m21;

    m[ 6] = -m00 * m21 * m33 +
    m00 * m31 * m23 +
    m01 * m20 * m33 -
    m01 * m30 * m23 -
    m03 * m20 * m31 +
    m03 * m30 * m21;

    m[10] = m00 * m11 * m33 -
    m00 * m31 * m13 -
    m01 * m10 * m33 +
    m01 * m30 * m13 +
    m03 * m10 * m31 -
    m03 * m30 * m11;

    m[14] = -m00 * m11 * m23 +
    m00 * m21 * m13 +
    m01 * m10 * m23 -
    m01 * m20 * m13 -
    m03 * m10 * m21 +
    m03 * m20 * m11;

    m[ 3] = -m10 * m21 * m32 +
    m10 * m31 * m22 +
    m11 * m20 * m32 -
    m11 * m30 * m22 -
    m12 * m20 * m31 +
    m12 * m30 * m21;

    m[ 7] = m00 * m21 * m32 -
    m00 * m31 * m22 -
    m01 * m20 * m32 +
    m01 * m30 * m22 +
    m02 * m20 * m31 -
    m02 * m30 * m21;

    m[11] = -m00 * m11 * m32 +
    m00 * m31 * m12 +
    m01 * m10 * m32 -
    m01 * m30 * m12 -
    m02 * m10 * m31 +
    m02 * m30 * m11;

    m[15] = m00 * m11 * m22 -
    m00 * m21 * m12 -
    m01 * m10 * m22 +
    m01 * m20 * m12 +
    m02 * m10 * m21 -
    m02 * m20 * m11;

    det = m00 * m[0] + m10 * m[4] + m20 * m[8] + m30 * m[12];

    if (det == 0){
        return null;
    }

    det = 1.0 / det;

    m[ 0] *= det; m[ 1] *= det; m[ 2] *= det; m[ 3] *= det;
    m[ 4] *= det; m[ 5] *= det; m[ 6] *= det; m[ 7] *= det;
    m[ 8] *= det; m[ 9] *= det; m[10] *= det; m[11] *= det;
    m[12] *= det; m[13] *= det; m[14] *= det; m[15] *= det;

    return this;
};
//endregion

var Math_ = {
    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    normalize : function (value, start, end) {
        return (value - start) / (end - start);
    },
    map: function (value, inStart, inEnd, outStart, outEnd) {
        return outStart + (outEnd - outStart) * this.normalize(value, inStart, inEnd);
    }
};

/*--------------------------------------------------------------------------------------------*/
//  CameraOrbiter
/*--------------------------------------------------------------------------------------------*/

var ERROR_MSG_NO_CAMERA_SET = 'No Camera set.';

var DEFAULT_SPEED = 0.125;
var DEFAULT_DISTANCE_SPEED = 0.15;

var DEFAULT_DISTANCE_MIN = 1,
    DEFAULT_DISTANCE_MAX = Number.MAX_VALUE,
    DEFAULT_DISTANCE_STEP = 0.25;

var DEFAULT_PAN_START = Math.PI * 0.25,
    DEFAULT_PAN_RANGE = Math.PI * 0.125,
    DEFAULT_ROTATE_RANGE = Math.PI * 2;

var DEFAULT_AUTO_ROTATION_SPEED = 0.00025,
    DEFAULT_AUTO_PAN_SPEED = 0.000125,
    DEFAULT_AUTO_PAN_ROTATION = DEFAULT_PAN_RANGE;

var AXIS_Y = new Vec3(0,1,0),
    AXIS_X = new Vec3(1,0,0);

function CameraOrbiter(window,camera){
    camera.setDistance = function(distance){
        this.position.sub(this.target).normalize().scale(distance);
        this.updateMatrices();
    };

    camera.getDistance = function(){
        return this.target.distance(this.position);
    };

    this._window = window;

    this._speed = DEFAULT_SPEED;

    // distance from center to eye
    this._distance = null;
    // distance from target
    this._distanceStep   = DEFAULT_DISTANCE_STEP;
    this._distanceMax    = DEFAULT_DISTANCE_MAX;
    this._distanceMin    = DEFAULT_DISTANCE_MIN;
    // distance to move to
    this._distanceTarget = null;
    this._distanceSpeed = DEFAULT_DISTANCE_SPEED;

    // camera to use
    this._camera = null;

    // pan starting from
    this._panStart = DEFAULT_PAN_START;
    // pan start + range = max range
    this._panRange = DEFAULT_PAN_RANGE;
    // normalized mouse x * range = rotation
    this._rotateRange = DEFAULT_ROTATE_RANGE;

    this._posMouseDown  = new Vec2();
    this._posSphereDrag = new Vec3();

    // orientation
    this._orientDown = new Quat();
    this._orientDrag = new Quat();
    this._orientTarget = new Quat();
    this._orientCurr = new Quat();
    // auto orientation rotate - pan, will be merged
    this._orientAutoRotate = new Quat();
    this._orientAutoPan = new Quat();
    this._orientResult = new Quat();

    //local/global rotation delta
    this._localDelta  = new Vec2();
    this._globalDelta = new Vec2();

    //target axis, null if no axis
    //this._axis = null;
    //this._axisForced = false;

    this._autoRotation = 0;
    this._autoRotationSpeed = DEFAULT_AUTO_ROTATION_SPEED;

    this._autoPan = 0;
    this._autoPanRange = DEFAULT_AUTO_PAN_ROTATION;
    this._autoPanSpeed = DEFAULT_AUTO_PAN_SPEED;
    this._autoStopOnDrag = false;

    this._dragging = false;

    var self = this;
    function map(x,y,out){
        x = x * self._rotateRange + Math.PI * 0.5;
        y = self._panStart + (1.0 - Math_.clamp(y,0,1))  * self._panRange;
        return (out || new Vec3()).setf(
            self._distance * Math.sin(y) * Math.cos(x),
            self._distance * Math.cos(y),
            self._distance * Math.sin(y) * Math.sin(x));
    }

    window.on('leftMouseDown',function(e){
        if(self._interactive && !self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(e.handled || !self._interactive){
            return;
        }
        var mx,my;
        mx = 1.0 - e.x / window.width;
        my = 1.0 - e.y / window.height;

        self._posMouseDown.setf(mx, my);

        self._orientDown.set(self._orientCurr);
        self._orientDrag.set(self._orientDown);

        self._localDelta.toZero();
        self._dragging = true;
    });

    window.on('leftMouseUp',function(e){
        if(e.handled || !self._interactive){
            return;
        }
        self._globalDelta.add(self._localDelta);
        self._globalDelta.y = Math_.clamp(self._globalDelta.y, 0, 1);

        self._dragging = false;
    });

    window.on('mouseDragged',function(e){
        if(self._interactive && !self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(e.handled || !self._interactive){
            return;
        }
        var mx,my;
        mx = 1.0 - e.x / window.width;
        my = 1.0 - e.y / window.height;

        self._localDelta.setf(self._posMouseDown.x - mx,
                              self._posMouseDown.y - my);

        map(self._globalDelta.x + self._localDelta.x,
            self._globalDelta.y + self._localDelta.y,
            self._posSphereDrag);

        self._posSphereDrag.normalize();
        self._orientDrag.setFromDirection(self._posSphereDrag).normalize();
        self._orientTarget.set(self._orientDrag);
    });

    window.on('scrollWheel',function(e){
        if(self._interactive && !self._camera){
            throw new Error(ERROR_MSG_NO_CAMERA_SET);
        }
        if(e.handled || !self._interactive){
            return;
        }
        self._distanceTarget += (e.dy < 0 ? 1 : e.dy > 0 ? -1 : 0) * self._distanceStep;
        self._constrainDistanceTarget();
    });

    this._interactive = true;

    //target view matrix temp
    this._matrix = new Matrix44();

    this.setCamera(camera);
}

/**
 * Sets the camera to be used.
 * @param camera
 */

CameraOrbiter.prototype.setCamera = function(camera){
    this._camera = camera;

    this._orientCurr.setFromAxisAnglef(0,1,0,0);
    this._orientDrag.set(this._orientCurr);
    this._orientTarget.set(this._orientCurr);

    this._distance = this._distanceTarget = camera.getDistance();
};

/**
 * Sets camera movement interpolation speed.
 * @param speed
 */

CameraOrbiter.prototype.setSpeed = function(speed){
    this._speed = speed;
};

/**
 * Sets panning start and range.
 * @param start
 * @param range
 */

CameraOrbiter.prototype.setPan = function(start,range){
    this._panStart = start;
    this._panRange = range;
};

/**
 * Sets rotation range.
 * @param range
 */

CameraOrbiter.prototype.setRotate = function(range){
    this._rotateRange = range;
};


/**
 * Sets the auto rotation speed.
 * @param speed
 */

CameraOrbiter.prototype.setAutoRotation = function(speed){
    this._autoRotationSpeed = speed;
};

/**
 * Sets the auto pan range and speed.
 * @param range
 * @param [speed]
 */

CameraOrbiter.prototype.setAutoPan = function(range,speed){
    this._autoPanRange = range;
    this._autoPanSpeed = speed === undefined ? this._autoPanSpeed : speed;
};

/**
 * Defines the ondrag behaviour for auto rotation & panning.
 * @param stop
 */

CameraOrbiter.prototype.setStopAutoOnDrag = function(stop){
    this._autoStopOnDrag = stop;
};

/**
 * Sets the max distance from target.
 * @param {Number} max
 */

CameraOrbiter.prototype.setDistanceMax = function(max){
    this._distanceMax = max;
    this._constrainDistanceTarget();
};

/**
 * Sets the max min distance from target.
 * @param {Number} min
 */

CameraOrbiter.prototype.setDistanceMin = function(min){
    this._distanceMin = min;
    this._constrainDistanceTarget();
};

CameraOrbiter.prototype._constrainDistanceTarget = function(){
    this._distanceTarget = Math.max(this._distanceMin,Math.min(this._distanceTarget,this._distanceMax));
};

/**
 * Sets the distance between eye and target.
 * @param {Number} dist
 */

CameraOrbiter.prototype.setDistance = function(dist, opts){
    this._distanceTarget = dist;
    if (opts && opts.force) {
        this._distance = dist;
    }
};

/**
 * Returns the current distance
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistance = function(){
    return this._distance;
};

/**
 * Returns the maximum distance.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceMin = function(){
    return this._distanceMin;
};

/**
 * Returns the minimum distance.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceMax = function(){
    return this._distanceMax;
};

/**
 * Returns the current distance normalized.
 * @returns {Number}
 */

CameraOrbiter.prototype.getDistanceNormalized = function(min,max){
    min = min === undefined ? 0.0 : min;
    max = max === undefined ? 1.0 : max;
    return Math_.map(this._distance,this._distanceMin,this._distanceMax,min,max);
};

/**
 * Enables interactivity.
 */

CameraOrbiter.prototype.enable = function(){
    this._interactive = true;
};

/**
 * Disables interactivity.
 */

CameraOrbiter.prototype.disable = function(){
    this._interactive = false;
};

CameraOrbiter.prototype.enableAutoMode = function(enable){
    if(!enable){
        this._distanceSpeed  = DEFAULT_DISTANCE_SPEED;
        this._speed          = DEFAULT_SPEED;
        this._distanceTarget = this._distance;
        return;
    }

    this._distanceTarget = this._distanceMin + (this._distanceMax - this._distanceMin) * Math.random();
    this._distanceSpeed = 0.005;

    console.log('CameraOrbiter.enableAutoMode _distanceTarget', this._distanceTarget);
};

/**
 * Apply the camera view matrix transformation.
 */

var MATRIX_TEMP = new Matrix44();

CameraOrbiter.prototype.apply = function(){
    var camera, viewMatrix;
    var target, curr, result;
    var autoRotate, autoPan;

    camera     = this._camera;
    viewMatrix = this._camera.viewMatrix;

    this._distance += (this._distanceTarget - this._distance) * this._distanceSpeed;
    camera.setDistance(this._distance);

    this._autoRotation += this._autoRotationSpeed;
    this._autoPan      += this._autoPanSpeed;

    target = this._orientTarget;
    curr   = this._orientCurr;
    result = this._orientResult;

    autoRotate = this._orientAutoRotate;
    autoPan    = this._orientAutoPan;

    if(!(this._autoStopOnDrag && this._dragging)){
        autoRotate.setFromAxisAngle(AXIS_Y,this._autoRotation);
        autoPan.setFromAxisAngle(AXIS_X,(0.5 + Math.sin(this._autoPan * Math.PI) * 0.5) * this._autoPanRange);
    }

    result.set(autoRotate).mult(target).mult(autoPan);
    curr.linearInterpolateTo(result,this._speed);

    MATRIX_TEMP.identity();
    MATRIX_TEMP.translatef(0,0,-this._distance);
    MATRIX_TEMP.mult(curr.toMatrix44(this._matrix).invert());

    viewMatrix.a11 = MATRIX_TEMP.m[ 0];
    viewMatrix.a21 = MATRIX_TEMP.m[ 1];
    viewMatrix.a31 = MATRIX_TEMP.m[ 2];
    viewMatrix.a41 = MATRIX_TEMP.m[ 3];

    viewMatrix.a12 = MATRIX_TEMP.m[ 4];
    viewMatrix.a22 = MATRIX_TEMP.m[ 5];
    viewMatrix.a32 = MATRIX_TEMP.m[ 6];
    viewMatrix.a42 = MATRIX_TEMP.m[ 7];

    viewMatrix.a13 = MATRIX_TEMP.m[ 8];
    viewMatrix.a23 = MATRIX_TEMP.m[ 9];
    viewMatrix.a33 = MATRIX_TEMP.m[10];
    viewMatrix.a43 = MATRIX_TEMP.m[11];

    viewMatrix.a14 = MATRIX_TEMP.m[12];
    viewMatrix.a24 = MATRIX_TEMP.m[13];
    viewMatrix.a34 = MATRIX_TEMP.m[14];
    viewMatrix.a44 = MATRIX_TEMP.m[15];
};

module.exports = CameraOrbiter;