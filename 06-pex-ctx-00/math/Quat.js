function create() {
    return [0, 0, 0, 1];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1] &&
           a[2] == b[2] &&
           a[3] == b[3];
}

var Quat = {
    create : create,
    equals : equals
};

module.exports = Quat;
