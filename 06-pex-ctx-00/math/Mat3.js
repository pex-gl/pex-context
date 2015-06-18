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

var Mat3 = {
    create : create,
    equals : equals
};

module.exports = Mat3;
