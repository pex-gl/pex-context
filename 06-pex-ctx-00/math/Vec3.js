function equals(a,b){
    return a[0] == b[0] &&
           a[1] == b[1] &&
           a[2] == b[2];
}

var Vec3 = {
    equals : equals
};

module.exports = Vec3;