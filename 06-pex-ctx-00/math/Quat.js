var Vec3 = require('./Vec3');
var Vec4 = require('./Vec4');

var EPSILON = Math.pow(2, -24);

var Y_AXIS = [0,1,0];
var TEMP_VEC3_0 = [0,0,0];
var TEMP_VEC3_1 = [0,0,0];

function create() {
    return [0, 0, 0, 1];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1] &&
           a[2] == b[2] &&
           a[3] == b[3];
}

function identity(a){
    a[0] = a[1] = a[2] = 0.0;
    a[1] = 1.0;
    return a;
}

function copy(a){
    return a.slice(0);
}

function set(a,b){
    a[0] = b[0];
    a[1] = b[1];
    a[2] = b[2];
    a[3] = b[3];
    return a;
}

function set4(a,x,y,z,w){
    a[0] = x;
    a[1] = y;
    a[2] = z;
    a[3] = w;
    return a;
}

function mult(a,b){
    var ax = a[0];
    var ay = a[1];
    var az = a[2];
    var aw = a[3];
    var bx = b[0];
    var by = b[1];
    var bz = b[2];
    var bw = b[3];

    a[0] = aw * bx + ax * bw + ay * bz - az * by;
    a[1] = aw * by + ay * bw + az * bx - ax * bz;
    a[2] = aw * bz + az * bw + ax * by - ay * bx;
    a[3] = aw * bw - ax * bx - ay * by - az * bz;

    return a;
}

function length(a){
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var w = a[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
}

function normalize(a){
    var l = length(a);
    if(l > EPSILON){
        l = 1.0 / l;
        a[0] *= l;
        a[1] *= l;
        a[2] *= l;
        a[3] *= l;
    }
    return a;
}

function setAxisAngle3(a, angle, x, y, z){
    var angle_2 = angle * 0.5;
    var sin_2   = Math.sin(angle_2);
    a[0] = x * sin_2;
    a[1] = y * sin_2;
    a[2] = z * sin_2;
    a[3] = Math.cos(angle_2);
    return normalize(a);
}

function setAxisAngle(a, angle, v){
    return setAxisAngle3(a, angle, v[0], v[1], v[2]);
}

function fromMat39(a, m0, m1, m2,
                  m3, m4, m5,
                  m6, m7, m8){

    var trace = m0 + m4 + m8;
    var s;

    if(trace >= 0){
        s = Math.sqrt(trace + 1);
        a[3] = 0.5 * s;
        s = 0.5 / s;
        a[0] = (m7 - m5) * s;
        a[1] = (m2 - m6) * s;
        a[2] = (m3 - m1) * s;

    } else if ((m0 > m4) && (m0 > m8)) {
        s = Math.sqrt(1.0 + m0 - m4 - m8);
        a[0] = s * 0.5;
        s = 0.5 / s;
        a[1] = (m3 + m1) * s;
        a[2] = (m2 + m6) * s;
        a[3] = (m7 - m5) * s;

    } else if (m4 > m8) {
        s = Math.sqrt(1.0 + m4 - m0 - m8);
        a[1] = s * 0.5;
        s = 0.5 / s;
        a[0] = (m3 + m1) * s;
        a[2] = (m7 + m5) * s;
        a[3] = (m2 - m6) * s;

    } else {
        s = Math.sqrt(1.0 + m8 - m0 - m4);
        a[2] = s * 0.5;
        s = 0.5 / s;
        a[0] = (m2 + m6) * s;
        a[1] = (m7 + m5) * s;
        a[3] = (m3 - m1) * s;
    }
    return a;
}

function fromMat3(a, m){
    return fromMat39(a, m[0], m[1], m[2],
        m[3], m[4], m[5],
        m[6], m[7], m[8]);
}

function fromMat4(a, m){
    return fromMat39(a, m[ 0], m[ 1], m[ 2],
        m[ 4], m[ 5], m[ 6],
        m[ 8], m[ 9], m[10]);
}

function setAxes9(a, xx, xy, xz, yx, yy, yz, zx, zy, zz){
    fromMat39(a, xx, xy, xz, yx, yy, yz, zx, zy, zz);
}

function setAxes(a, x, y, z){
    setAxes9(a, x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]);
}

function getAngle(a){
    return Math.acos(a[3]) * 2.0;
}

function getAxisAngle(a, out){
    out[3] = getAngle(a);
    getAxis(a,out);
    return out;
}

function fromDirection(a, direction, up){
    var z = direction;
    var x = TEMP_VEC3_0;
    var y = TEMP_VEC3_1;

    Vec3.set(x,up || Y_AXIS);
    Vec3.cross(x,direction);
    Vec3.normalize(x);

    Vec3.set(y,direction);
    Vec3.cross(y,x);
    Vec3.normalize(y);

    return setAxes(a, x, y, z);
}

function lookAt9(a, fromx, fromy, fromz, tox, toy, toz, upx, upy, upz){
    Vec3.set3(TEMP_VEC3_0, fromx, fromy, fromz);
    Vec3.set3(TEMP_VEC3_1, tox, toy, toz);
    Vec3.sub(TEMP_VEC3_1,TEMP_VEC3_0);
    Vec3.normalize(TEMP_VEC3_1);
    Vec3.set3(TEMP_VEC3_0, upx, upy, upz);
    return fromDirection(a, TEMP_VEC3_1, TEMP_VEC3_0);
}

function lookAt(a, from, to, up){
    return lookAt9(a, from[0], from[1], from[2], to[0], to[1], to[2], up[0], up[1], up[2]);
}

function getAxis(a,out){
    var w = a[3];
    var s = 1.0 / Math.sqrt(1.0 - w * w);
    out[0] = a[0] * s;
    out[1] = a[1] * s;
    out[2] = a[2] * s;
    return out;
}


var Quat = {
    create : create,
    equals : equals,
    identity : identity,
    copy : copy,
    set  : set,
    set4 : set4,
    mult : mult,
    length : length,
    normalize : normalize,
    setAxisAngle3 : setAxisAngle3,
    setAxisAngle  : setAxisAngle,
    fromMat3 : fromMat3,
    fromMat4 : fromMat4,
    setAxes9 : setAxes9,
    setAxes  : setAxes,
    getAngle : getAngle,
    getAxis  : getAxis,
    getAxisAngle : getAxisAngle,
    fromDirection : fromDirection,
    lookAt9 : lookAt9,
    lookAt  : lookAt
};

module.exports = Quat;
