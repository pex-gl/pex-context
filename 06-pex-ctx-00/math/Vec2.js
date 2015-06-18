function create() {
    return [0, 0];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1];
}

function copy(a,out){
    if(out !== undefined){
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    return a.slice(0);
}

var Vec2 = {
    create : create,
    copy   : copy,
    equals : equals
};

module.exports = Vec2;