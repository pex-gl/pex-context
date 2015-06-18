function create() {
    return [0, 0];
}

function equals(a,b) {
    return a[0] == b[0] &&
           a[1] == b[1];
}

function equals2(a,x,y){
    return a[0] == x &&
           a[1] == y;
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
    create  : create,
    copy    : copy,
    equals  : equals,
    equals2 : equals2
};

module.exports = Vec2;