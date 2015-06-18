function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1];
}

var Vec2 = {
    equals : equals
};

module.exports = Vec2;
