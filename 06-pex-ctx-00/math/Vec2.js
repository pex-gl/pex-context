function create() {
    return [0, 0];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1];
}

var Vec2 = {
    create : create,
    equals : equals
};

module.exports = Vec2;
