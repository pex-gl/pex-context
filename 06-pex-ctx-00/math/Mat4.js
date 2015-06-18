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

function copy(a,b) {
    if(b !== undefined){
        for(var i = a.length - 1; 0 <= i; --i){
            b[i] = a[i];
        }
        return b;
    }
    return a.slice(0);
}

function identity(a) {
    a[0] = a[5] = a[10] = a[15] = 1;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
    return a;
}

function perspective(a,fov, aspect, near, far) {
    var f = 1.0 / Math.tan(fov * 0.5);
    var nf = 1.0 / (near - far);

    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;

    a[0] = f / aspect;
    a[5] = f;
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

var Mat4 = {
    create : create,
    equals : equals,
    copy : copy,
    identity : identity,
    perspective : perspective,
    ortho : ortho
};

module.exports = Mat4;
