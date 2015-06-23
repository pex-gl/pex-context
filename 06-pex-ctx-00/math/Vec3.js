function create() {
    return [0, 0, 0];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1] &&
           a[2] == b[2];
}

function equals3(a,x,y,z){
    return a[0] == x &&
           a[1] == y &&
           a[2] == z;
}

function set(a,b){
    a[0] = b[0];
    a[1] = b[1];
    a[2] = b[2];
    return a;
}

function set3(a,x,y,z){
    a[0] = x;
    a[1] = y;
    a[2] = z;
    return a;
}

function add(a,b){
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
    return a;
}

function add3(a,x,y,z){
    a[0] += x;
    a[1] += y;
    a[2] += z;
    return a;
}

function sub(a,b){
    a[0] -= b[0];
    a[1] -= b[1];
    a[2] -= b[2];
    return a;
}

function sub3(a,x,y,z){
    a[0] -= x;
    a[1] -= y;
    a[2] -= z;
    return a;
}

function scale(a,n){
    a[0] *= n;
    a[1] *= n;
    a[2] *= n;
    return a;
}

function multMat4(a,m){
    var x = a[0];
    var y = a[1];
    var z = a[2];

    a[0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
    a[1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
    a[2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];

    return a;
}

function dot(a,b){
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a,b){
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var vx = b[0];
    var vy = b[1];
    var vz = b[2];

    a[0] = y * vz - vy * z;
    a[1] = z * vx - vz * x;
    a[2] = x * vy - vx * y;
    return a;
}

function cross3(a,x,y,z){
    var _x = a[0];
    var _y = a[1];
    var _z = a[2];

    a[0] = _y * z - y * _z;
    a[1] = _z * x - z * _x;
    a[2] = _x * y - x * _y;
    return a;
}

function length(a){
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

function lengthSq(a){
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return x * x + y * y + z * z;
}

function normalize(a){
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var l = Math.sqrt(x * x + y * y + z * z);

    l = 1.0 / (l || 1);
    a[0] *= l;
    a[1] *= l;
    a[2] *= l;
    return a;
}

function distance(a,b){
    return distance3(a,b[0],b[1],b[2]);
}

function distance3(a,x,y,z){
    var dx = x - a[0];
    var dy = y - a[1];
    var dz = z - a[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceSq(a,b){
    return distanceSq3(a,b[0],b[1],b[2]);
}

function distanceSq3(a,x,y,z){
    var dx = x - a[0];
    var dy = y - a[1];
    var dz = z - a[2];
    return dx * dx + dy * dy + dz * dz;
}

function limit(a,n){
    var x = a[0];
    var y = a[1];
    var z = a[2];

    var dsq = x * x + y * y + z * z;
    var lsq = n * n;

    if(lsq > 0 && dsq > lsq){
        var nd = n / Math.sqrt(dsq);
        a[0] *= nd;
        a[1] *= nd;
        a[2] *= nd;
    }

    return a;
}

function invert(a){
    a[0] *= -1;
    a[1] *= -1;
    a[2] *= -1;
    return a;
}

function lerp(a,b,n){
    var x = a[0];
    var y = a[1];
    var z = a[2];

    a[0] = x + (b[0] - x) * n;
    a[1] = y + (b[1] - y) * n;
    a[2] = z + (b[2] - z) * n;

    return a;
}

function toZero(a){
    a[0] = a[1] = a[2] = 0;
    return a;
}

function toOne(a){
    a[0] = a[1] = a[2] = 1;
    return a;
}

function toMax(a){
    a[0] = a[1] = a[2] = Number.MAX_VALUE;
    return a;
}

function toMin(a){
    a[0] = a[1] = a[2] = -Number.MAX_VALUE;
    return a;
}

function toAbs(a){
    a[0] = Math.abs(a[0]);
    a[1] = Math.abs(a[1]);
    a[2] = Math.abs(a[2]);
}

function xAxis(){
    return [1,0,0];
}

function yAxis(){
    return [0,1,0];
}

function zAxis(){
    return [0,0,1];
}

function copy(a,out){
    if(out !== undefined){
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
    }
    return a.slice(0);
}


var Vec3 = {
    create  : create,
    set     : set,
    set3    : set3,
    copy    : copy,
    equals  : equals,
    equals3 : equals3,
    add  : add,
    add3 : add3,
    sub  : sub,
    sub3 : sub3,
    scale : scale,
    multMat4 : multMat4,
    dot : dot,
    cross  : cross,
    cross3 : cross3,
    length   : length,
    lengthSq : lengthSq,
    normalize : normalize,
    distance    : distance,
    distance3   : distance3,
    distanceSq  : distanceSq,
    distanceSq3 : distanceSq3,
    invert : invert,
    lerp : lerp,
    toZero : toZero,
    toOne  : toOne,
    toMin  : toMin,
    toMax  : toMax,
    toAbs  : toAbs,
    xAxis : xAxis,
    yAxis : yAxis,
    zAxis : zAxis
};

module.exports = Vec3;
