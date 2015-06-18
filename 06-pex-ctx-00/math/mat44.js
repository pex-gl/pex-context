function create(){
    return new Array([
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);
}

function copy(a,b){
    if(b !== undefined){
        for(var i = a.length - 1; 0 <= i; --i){
            b[i] = a[i];
        }
        return b;
    }
    return a.slice(0);
}

var mat44 = {
    create : create,
    copy : copy
};

module.exports = mat44;