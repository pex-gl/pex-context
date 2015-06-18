function create() {
    return [0, 0, 0, 0];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1] &&
           a[2] == b[2] &&
           a[3] == b[3];
}

function equals4(a,x,y,z,w){
    return a[0] == x &&
           a[1] == y &&
           a[2] == z &&
           a[3] == w;
}

function set4(a,x,y,z,w){
    a[0] = x;
    a[1] = y;
    a[2] = z;
    a[3] = w;
    return a;
}

function copy(a,out){
    if(out !== undefined){
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        return out;
    }
    return a.slice(0);
}

var Vec4 = {
<<<<<<< HEAD
    set4    : set4,
    copy    : copy,
    equals  : equals,
    equals4 : equals4
=======
    create : create,
    equals : equals
>>>>>>> origin/master
};

module.exports = Vec4;
