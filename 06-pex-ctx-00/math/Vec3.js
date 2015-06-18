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

function set3(a,x,y,z){
    a[0] = x;
    a[1] = y;
    a[2] = z;
    return a;
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
<<<<<<< HEAD
    set3    : set3,
    copy    : copy,
    equals  : equals,
    equals3 : equals3
=======
    create : create,
    equals : equals
>>>>>>> origin/master
};

module.exports = Vec3;
