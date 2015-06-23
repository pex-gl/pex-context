/*
*  Row major memory layout
*
*   0   1   2   3
*   4   5   6   7
*   8   9  10  11
*  12  13  14  15
*
*  equivalent to the column major OpenGL spec
*
*   0   4   8  12
*   1   5   9  13
*   2   6  10  14
*   3   7  11  15
*
*  m00 m10 m20 m30
*  m01 m11 m21 m31
*  m02 m12 m22 m32
*  m03 m13 m23 m33
*/
function create() {
    return [
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ];
}

function set(a,b){
    a[ 0] = b[ 0]; a[ 1] = b[ 1]; a[ 2] = b[ 2]; a[ 3] = b[ 3];
    a[ 4] = b[ 4]; a[ 5] = b[ 5]; a[ 6] = b[ 6]; a[ 7] = b[ 7];
    a[ 8] = b[ 8]; a[ 9] = b[ 9]; a[10] = b[10]; a[11] = b[11];
    a[12] = b[12]; a[13] = b[13]; a[14] = b[14]; a[15] = b[15];
    return a;
}

function set16(a,a00,a01,a02,a03,
                 a10,a11,a12,a13,
                 a20,a21,a22,a23,
                 a30,a31,a32,a33){
    a[ 0] = a00; a[ 1] = a01; a[ 2] = a02; a[ 3] = a03;
    a[ 4] = a10; a[ 5] = a11; a[ 6] = a12; a[ 7] = a13;
    a[ 8] = a20; a[ 9] = a21; a[10] = a22; a[11] = a23;
    a[12] = a30; a[13] = a31; a[14] = a32; a[15] = a33;
    return a;
}

function equals(a,b) {
    return a[ 0] == b[ 0] &&
           a[ 1] == b[ 1] &&
           a[ 2] == b[ 2] &&
           a[ 3] == b[ 3] &&
           a[ 4] == b[ 4] &&
           a[ 5] == b[ 5] &&
           a[ 6] == b[ 6] &&
           a[ 7] == b[ 7] &&
           a[ 8] == b[ 8] &&
           a[ 9] == b[ 9] &&
           a[10] == b[10] &&
           a[11] == b[11] &&
           a[12] == b[12] &&
           a[13] == b[13] &&
           a[14] == b[14] &&
           a[15] == b[15];
}

function copy(a) {
    return a.slice(0);
}

function mult16(a,b00,b01,b02,b03,
                  b10,b11,b12,b13,
                  b20,b21,b22,b23,
                  b30,b31,b32,b33){
    var a00 = a[ 0], a01 = a[ 1], a02 = a[ 2], a03 = a[ 3];
    var a10 = a[ 4], a11 = a[ 5], a12 = a[ 6], a13 = a[ 7];
    var a20 = a[ 8], a21 = a[ 9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    a[ 0] = (b00 * a00) + (b01 * a10) + (b02 * a20) + (b03 * a30);
    a[ 1] = (b00 * a01) + (b01 * a11) + (b02 * a21) + (b03 * a31);
    a[ 2] = (b00 * a02) + (b01 * a12) + (b02 * a22) + (b03 * a32);
    a[ 3] = (b00 * a03) + (b01 * a13) + (b02 * a23) + (b03 * a33);

    a[ 4] = (b10 * a00) + (b11 * a10) + (b12 * a20) + (b13 * a30);
    a[ 5] = (b10 * a01) + (b11 * a11) + (b12 * a21) + (b13 * a31);
    a[ 6] = (b10 * a02) + (b11 * a12) + (b12 * a22) + (b13 * a32);
    a[ 7] = (b10 * a03) + (b11 * a13) + (b12 * a23) + (b13 * a33);

    a[ 8] = (b20 * a00) + (b21 * a10) + (b22 * a20) + (b23 * a30);
    a[ 9] = (b20 * a01) + (b21 * a11) + (b22 * a21) + (b23 * a31);
    a[10] = (b20 * a02) + (b21 * a12) + (b22 * a22) + (b23 * a32);
    a[11] = (b20 * a03) + (b21 * a13) + (b22 * a23) + (b23 * a33);

    a[12] = (b30 * a00) + (b31 * a10) + (b32 * a20) + (b33 * a30);
    a[13] = (b30 * a01) + (b31 * a11) + (b32 * a21) + (b33 * a31);
    a[14] = (b30 * a02) + (b31 * a12) + (b32 * a22) + (b33 * a32);
    a[15] = (b30 * a03) + (b31 * a13) + (b32 * a23) + (b33 * a33);

    return a;
}

function mult(a,b){
    var a00 = a[ 0], a01 = a[ 1], a02 = a[ 2], a03 = a[ 3];
    var a10 = a[ 4], a11 = a[ 5], a12 = a[ 6], a13 = a[ 7];
    var a20 = a[ 8], a21 = a[ 9], a22 = a[10], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    var b00 = b[ 0], b01 = b[ 1], b02 = b[ 2], b03 = b[ 3];
    var b10 = b[ 4], b11 = b[ 5], b12 = b[ 6], b13 = b[ 7];
    var b20 = b[ 8], b21 = b[ 9], b22 = b[10], b23 = b[11];
    var b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

    a[ 0] = (b00 * a00) + (b01 * a10) + (b02 * a20) + (b03 * a30);
    a[ 1] = (b00 * a01) + (b01 * a11) + (b02 * a21) + (b03 * a31);
    a[ 2] = (b00 * a02) + (b01 * a12) + (b02 * a22) + (b03 * a32);
    a[ 3] = (b00 * a03) + (b01 * a13) + (b02 * a23) + (b03 * a33);

    a[ 4] = (b10 * a00) + (b11 * a10) + (b12 * a20) + (b13 * a30);
    a[ 5] = (b10 * a01) + (b11 * a11) + (b12 * a21) + (b13 * a31);
    a[ 6] = (b10 * a02) + (b11 * a12) + (b12 * a22) + (b13 * a32);
    a[ 7] = (b10 * a03) + (b11 * a13) + (b12 * a23) + (b13 * a33);

    a[ 8] = (b20 * a00) + (b21 * a10) + (b22 * a20) + (b23 * a30);
    a[ 9] = (b20 * a01) + (b21 * a11) + (b22 * a21) + (b23 * a31);
    a[10] = (b20 * a02) + (b21 * a12) + (b22 * a22) + (b23 * a32);
    a[11] = (b20 * a03) + (b21 * a13) + (b22 * a23) + (b23 * a33);

    a[12] = (b30 * a00) + (b31 * a10) + (b32 * a20) + (b33 * a30);
    a[13] = (b30 * a01) + (b31 * a11) + (b32 * a21) + (b33 * a31);
    a[14] = (b30 * a02) + (b31 * a12) + (b32 * a22) + (b33 * a32);
    a[15] = (b30 * a03) + (b31 * a13) + (b32 * a23) + (b33 * a33);

    return a;
}

function invert(a){
    var a00 = a[ 0], a10 = a[ 1], a20 = a[ 2], a30 = a[ 3];
    var a01 = a[ 4], a11 = a[ 5], a21 = a[ 6], a31 = a[ 7];
    var a02 = a[ 8], a12 = a[ 9], a22 = a[10], a32 = a[11];
    var a03 = a[12], a13 = a[13], a23 = a[14], a33 = a[15];

    //TODO: add caching

    a[ 0] =  a11 * a22 * a33 - a11 * a32 * a23 - a12 * a21 * a33 + a12 * a31 * a23 + a13 * a21 * a32 - a13 * a31 * a22;
    a[ 4] = -a01 * a22 * a33 + a01 * a32 * a23 + a02 * a21 * a33 - a02 * a31 * a23 - a03 * a21 * a32 + a03 * a31 * a22;
    a[ 8] =  a01 * a12 * a33 - a01 * a32 * a13 - a02 * a11 * a33 + a02 * a31 * a13 + a03 * a11 * a32 - a03 * a31 * a12;
    a[12] = -a01 * a12 * a23 + a01 * a22 * a13 + a02 * a11 * a23 - a02 * a21 * a13 - a03 * a11 * a22 + a03 * a21 * a12;

    a[ 1] = -a10 * a22 * a33 + a10 * a32 * a23 + a12 * a20 * a33 - a12 * a30 * a23 - a13 * a20 * a32 + a13 * a30 * a22;
    a[ 5] =  a00 * a22 * a33 - a00 * a32 * a23 - a02 * a20 * a33 + a02 * a30 * a23 + a03 * a20 * a32 - a03 * a30 * a22;
    a[ 9] = -a00 * a12 * a33 + a00 * a32 * a13 + a02 * a10 * a33 - a02 * a30 * a13 - a03 * a10 * a32 + a03 * a30 * a12;
    a[13] =  a00 * a12 * a23 - a00 * a22 * a13 - a02 * a10 * a23 + a02 * a20 * a13 + a03 * a10 * a22 - a03 * a20 * a12;

    a[ 2] =  a10 * a21 * a33 - a10 * a31 * a23 - a11 * a20 * a33 + a11 * a30 * a23 + a13 * a20 * a31 - a13 * a30 * a21;
    a[ 6] = -a00 * a21 * a33 + a00 * a31 * a23 + a01 * a20 * a33 - a01 * a30 * a23 - a03 * a20 * a31 + a03 * a30 * a21;
    a[10] =  a00 * a11 * a33 - a00 * a31 * a13 - a01 * a10 * a33 + a01 * a30 * a13 + a03 * a10 * a31 - a03 * a30 * a11;
    a[14] = -a00 * a11 * a23 + a00 * a21 * a13 + a01 * a10 * a23 - a01 * a20 * a13 - a03 * a10 * a21 + a03 * a20 * a11;

    a[ 3] = -a10 * a21 * a32 + a10 * a31 * a22 + a11 * a20 * a32 - a11 * a30 * a22 - a12 * a20 * a31 + a12 * a30 * a21;
    a[ 7] =  a00 * a21 * a32 - a00 * a31 * a22 - a01 * a20 * a32 + a01 * a30 * a22 + a02 * a20 * a31 - a02 * a30 * a21;
    a[11] = -a00 * a11 * a32 + a00 * a31 * a12 + a01 * a10 * a32 - a01 * a30 * a12 - a02 * a10 * a31 + a02 * a30 * a11;
    a[15] =  a00 * a11 * a22 - a00 * a21 * a12 - a01 * a10 * a22 + a01 * a20 * a12 + a02 * a10 * a21 - a02 * a20 * a11;

    var det = a00 * a[0] + a10 * a[4] + a20 * a[8] + a30 * a[12];

    if (det == 0){
        return null;
    }

    det = 1.0 / det;

    a[ 0] *= det; a[ 1] *= det; a[ 2] *= det; a[ 3] *= det;
    a[ 4] *= det; a[ 5] *= det; a[ 6] *= det; a[ 7] *= det;
    a[ 8] *= det; a[ 9] *= det; a[10] *= det; a[11] *= det;
    a[12] *= det; a[13] *= det; a[14] *= det; a[15] *= det;

    return a;
}

function transpose(a){
    var a01 = a[ 1], a02 = a[ 2], a03 = a[ 3];
    var a12 = a [6], a13 = a[ 7];
    var a20 = a[ 8], a21 = a[ 9], a23 = a[11];
    var a30 = a[12], a31 = a[13], a32 = a[14];

    //1st row - keeping a00
    a[ 1] = a[ 4]; a[ 2] = a20; a[ 3] = a30;
    //2nd row - keeping a11
    a[ 4] = a01; a[ 6] = a21; a[ 7] = a31;
    //3rd row - keeping a22
    a[ 8] = a02; a[ 9] = a12; a[11] = a32;
    //4th row - keeping a33
    a[12] = a03; a[13] = a13; a[14] = a23;

    return a;
}

function identity(a) {
    a[0] = a[5] = a[10] = a[15] = 1;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
    return a;
}

function setScale3(a, x, y, z){
    a[ 0] = x;
    a[ 5] = y;
    a[10] = z;
    return a;
}

function setScale(a, v){
    return setScale3(a,v[0],v[1],v[2]);
}

function scale3(a, x, y, z){
    return mult16(a,x,0,0,0,
                    0,y,0,0,
                    0,0,z,0,
                    0,0,0,1);
}

function scale(a, v){
    return scale3(a,v[0],v[1],v[2]);
}

function setTranslation3(a, x, y, z){
    a[12] = x;
    a[13] = y;
    a[14] = z;
    return a;
}

function setTranslation(a, v){
    return setTranslation3(a, v[0], v[1], v[2]);
}

function translate3(a, x, y, z){
    return mult16(a,1,0,0,0,
                    0,1,0,0,
                    0,0,1,0,
                    x,y,z,1);
}

function translate(a, v){
    return translate3(a, v[0], v[1], v[2]);
}

function setRotation3(a, r, x, y, z){
    var len = Math.sqrt(x * x + y * y + z * z);

    if (Math.sqrt(x * x + y * y + z * z) < 0.0001) {
        return null;
    }

    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;


    len = 1 / len;

    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(r);
    c = Math.cos(r);
    t = 1 - c;

    a00 = a11 = a22 = 1;
    a01 = a02 = a03 = a10 = a12 = a13 = a20 = a21 = a23 = 0;

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    a[0 ] = a00 * b00 + a10 * b01 + a20 * b02;
    a[1 ] = a01 * b00 + a11 * b01 + a21 * b02;
    a[2 ] = a02 * b00 + a12 * b01 + a22 * b02;
    a[3 ] = a03 * b00 + a13 * b01 + a23 * b02;
    a[4 ] = a00 * b10 + a10 * b11 + a20 * b12;
    a[5 ] = a01 * b10 + a11 * b11 + a21 * b12;
    a[6 ] = a02 * b10 + a12 * b11 + a22 * b12;
    a[7 ] = a03 * b10 + a13 * b11 + a23 * b12;
    a[8 ] = a00 * b20 + a10 * b21 + a20 * b22;
    a[9 ] = a01 * b20 + a11 * b21 + a21 * b22;
    a[10] = a02 * b20 + a12 * b21 + a22 * b22;
    a[11] = a03 * b20 + a13 * b21 + a23 * b22;

    return a;
}

function setRotation(a, r, v){
    return setRotation3(a, r, v[0], v[1], v[2]);
}

function rotate3(a, r, x, y, z){
    var len = Math.sqrt(x * x + y * y + z * z);

    if (Math.sqrt(x * x + y * y + z * z) < 0.0001) {
        return null;
    }

    var s, c, t;
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;
    var b00, b01, b02;
    var b10, b11, b12;
    var b20, b21, b22;


    len = 1 / len;

    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(r);
    c = Math.cos(r);
    t = 1 - c;

    a00 = a11 = a22 = 1;
    a01 = a02 = a03 = a10 = a12 = a13 = a20 = a21 = a23 = 0;

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    var _a00 = a00 * b00 + a10 * b01 + a20 * b02;
    var _a01 = a01 * b00 + a11 * b01 + a21 * b02;
    var _a02 = a02 * b00 + a12 * b01 + a22 * b02;
    var _a03 = a03 * b00 + a13 * b01 + a23 * b02;
    var _a10 = a00 * b10 + a10 * b11 + a20 * b12;
    var _a11 = a01 * b10 + a11 * b11 + a21 * b12;
    var _a12 = a02 * b10 + a12 * b11 + a22 * b12;
    var _a13 = a03 * b10 + a13 * b11 + a23 * b12;
    var _a20 = a00 * b20 + a10 * b21 + a20 * b22;
    var _a21 = a01 * b20 + a11 * b21 + a21 * b22;
    var _a22 = a02 * b20 + a12 * b21 + a22 * b22;
    var _a23 = a03 * b20 + a13 * b21 + a23 * b22;

    return mult16(a,_a00,_a01,_a02,_a03,
                    _a10,_a11,_a12,_a13,
                    _a20,_a21,_a22,_a23,
                     0,   0,   0,   1);
}

function rotate(a, r, v){
    return rotate3(a, r, v[0], v[1], v[2]);
}

function setRotationXYZ3(a, x, y, z){
    var cosx = Math.cos(x);
    var sinx = Math.sin(x);
    var cosy = Math.cos(y);
    var siny = Math.sin(y);
    var cosz = Math.cos(z);
    var sinz = Math.sin(z);

    // row 1
    a[ 0] = cosy * cosz;
    a[ 1] = -cosx * sinz + sinx * siny * cosz;
    a[ 2] = sinx * sinz + cosx * siny * cosz;

    // row 2
    a[ 4] = cosy * sinz;
    a[ 5] = cosx * cosz + sinx * siny * sinz;
    a[ 6] = -sinx * cosz + cosx * siny * sinz;

    // row3
    a[ 8] = -siny;
    a[ 9] = sinx * cosy;
    a[10] = cosx * cosy;

    return a;
}

function setRotationXYZ(a, v){
    return setRotationXYZ3(a, v[0], v[1], v[2]);
}

function rotateXYZ3(a, x, y, z){
    var cosx = Math.cos(x);
    var sinx = Math.sin(x);
    var cosy = Math.cos(y);
    var siny = Math.sin(y);
    var cosz = Math.cos(z);
    var sinz = Math.sin(z);

    var a00 =  cosy * cosz;
    var a01 = -cosx * sinz + sinx * siny * cosz;
    var a02 =  sinx * sinz + cosx * siny * cosz;
    var a10 =  cosy * sinz;
    var a11 =  cosx * cosz + sinx * siny * sinz;
    var a12 = -sinx * cosz + cosx * siny * sinz;
    var a20 = -siny;
    var a21 =  sinx * cosy;
    var a22 =  cosx * cosy;

    return mult16(a,a00,a01,a02,0,
                    a10,a11,a12,0,
                    a20,a21,a22,0,
                    0,  0,  0,  1);
}

function rotateXYZ(a, v){
    return rotateXYZ3(a, v[0], v[1], v[2]);
}

function setRotationFromOnB9(a, ux, uy, uz, vx, vy, vz, wx, wy, wz){
    a[ 0] = ux;
    a[ 1] = uy;
    a[ 2] = uz;

    a[ 4] = vx;
    a[ 5] = vy;
    a[ 6] = vz;

    a[ 8] = wx;
    a[ 9] = wy;
    a[10] = wz;

    return a;
}

function setRotationFromOnB(a, u, v, w){
    return setRotationFromOnB9(a, u[0], u[1], u[2], v[0], v[1], v[2], w[0], w[1], w[2]);
}

function createFromScale3(x,y,z){
    return setScale3(create(),x ,y ,z);
}

function createFromScale(v){
    return createFromScale3(v[0],v[1],v[2]);
}

function createFromTranslation3(x,y,z){
    return setTranslation3(create(),x, y, z);
}

function createFromTranslation(v){
    return createFromTranslation3(v[0],v[1],v[2]);
}

function createFromRotation3(r, x, y, z){
    return setRotation3(create(), r, x, y, z);
}

function createFromRotation(r, v){
    return createFromRotation3(r, v[0], v[1], v[2]);
}

function createFromRotationXYZ3(x, y, z) {
    return setRotationXYZ3(create(), x, y, z);
}

function createFromRotationXYZ(v){
    return createFromRotationXYZ3(v[0], v[1], v[2]);
}

function createFromOnB9(ux, uy, uz, vx, vy, vz, wx, wy, wz) {
    return setRotationFromOnB9(create(), ux, uy, uz, vx, vy, vz, wx, wy, wz);
}

function createFromOnB(u, v, w) {
    return createFromOnB9(u[0], u[1], u[2], v[0], v[1], v[2], w[0], w[1], w[2]);
}

/**
 * Calculate perspective matrix
 * @param  {Mat4} a        - out matrix
 * @param  {Number} fov    - field of view in degrees
 * @param  {Number} aspect - aspect ratio
 * @param  {Number} near   - near clipping plane
 * @param  {Number} far    - far clipping plane distance
 * @return {Mat4}          - returns out matrix
 */
function perspective(a,fov, aspect, near, far) {
    var f  = 1.0 / Math.tan(fov / 180.0 * Math.PI * 0.5);
    var nf = 1.0 / (near - far);

    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;

    a[ 0] = f / aspect;
    a[ 5] = f;
    a[10] = (far + near) * nf;
    a[11] = -1;
    a[14] = (2 * far * near) * nf;

    return a;
}

function ortho(a, left, right, bottom, top , near, far) {
    var lr = left - right;
    var bt = bottom - top;
    var nf = near - far;

    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = 0;

    a[0] = -2 / lr;
    a[5] = -2 / bt;
    a[10] = 2 / nf;

    a[12] = (left + right) / lr;
    a[13] = (top + bottom) / bt;
    a[14] = (far + near) / nf;
    a[15] = 1;

    return a;
}

function lookAt9(a, eyex, eyey, eyez, targetx, targety, targetz, upx, upy, upz) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

    if (Math.abs(eyex - targetx) < 0.000001 &&
        Math.abs(eyey - targety) < 0.000001 &&
        Math.abs(eyez - targetz) < 0.000001) {

        a[ 0] = 1;
        a[ 1] = a[ 2] = a[ 3] = 0;
        a[ 5] = 1;
        a[ 4] = a[ 6] = a[ 7] = 0;
        a[10] = 1;
        a[ 8] = a[ 9] = a[11] = 0;
        a[15] = 1;
        a[12] = a[13] = a[14] = 0;

        return;
    }

    z0 = eyex - targetx;
    z1 = eyey - targety;
    z2 = eyez - targetz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;

    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

    if(len){
        len = 1.0 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

    if(len){
        len = 1.0 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    a[ 0] = x0;
    a[ 1] = y0;
    a[ 2] = z0;
    a[ 3] = 0;
    a[ 4] = x1;
    a[ 5] = y1;
    a[ 6] = z1;
    a[ 7] = 0;
    a[ 8] = x2;
    a[ 9] = y2;
    a[10] = z2;
    a[11] = 0;
    a[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    a[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    a[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    a[15] = 1;

    return a;
}

function lookAt(a,from,to,up){
    return lookAt9(a,from[0],from[1],from[2],to[0],to[1],to[2],up[0],up[1],up[2]);
}

var Mat4 = {
    create : create,
    set    : set,
    set16  : set16,
    equals : equals,
    copy   : copy,
    mult16 : mult16,
    mult   : mult,
    invert : invert,
    transpose : transpose,
    setScale3 : setScale3,
    setScale  : setScale,
    scale3    : scale3,
    scale     : scale,
    setTranslation3 : setTranslation3,
    setTranslation  : setTranslation,
    translate3      : translate3,
    translate       : translate,
    setRotationXYZ3 : setRotationXYZ3,
    setRotationXYZ  : setRotationXYZ,
    rotateXYZ3      : rotateXYZ3,
    rotateXYZ       : rotateXYZ,
    setRotation3 : setRotation3,
    setRotation  : setRotation,
    rotate3      : rotate3,
    rotate       : rotate,
    setRotationFromOnB9 : setRotationFromOnB9,
    setRotationFromOnB  : setRotationFromOnB,
    identity : identity,
    createFromScale3 : createFromScale3,
    createFromScale  : createFromScale,
    createFromTranslation3 : createFromTranslation3,
    createFromTranslation  : createFromTranslation,
    createFromRotation3 : createFromRotation3,
    createFromRotation  : createFromRotation,
    createFromRotationXYZ  : createFromRotationXYZ,
    createFromRotationXYZ3 : createFromRotationXYZ3,
    createFromOnB9 : createFromOnB9,
    createFromOnB  : createFromOnB,
    perspective : perspective,
    ortho       : ortho,
    lookAt9 : lookAt9,
    lookAt  : lookAt
};

module.exports = Mat4;
