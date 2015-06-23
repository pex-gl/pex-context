/*
*  Row major memory layout
*
*   0   1   2
*   3   4   5
*   6   7   8
*
*  equivalent to the column major OpenGL spec
*
*   0   3   6
*   1   4   7
*   2   5   8
*
*  m00 m10 m20
*  m01 m11 m21
*  m02 m12 m22
*/

function create() {
    return [
        1,0,0,
        0,1,0,
        0,0,1
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
           a[ 9] == b[ 9];
}

function fromMat4(a,b){
    a[ 0] = b[ 0]; a[ 1] = b[ 1]; a[ 2] = b[ 2];
    a[ 3] = b[ 4]; a[ 4] = b[ 5]; a[ 5] = b[ 6];
    a[ 6] = b[ 8]; a[ 7] = b[ 9]; a[ 8] = b[10];
    return a;
}

var Mat3 = {
    create : create,
    equals : equals,
    fromMat4 : fromMat4
};

module.exports = Mat3;
