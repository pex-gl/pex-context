function copy(a,out){
    if(out !== undefined){
        out[0] = a[0];
        out[1] = a[1];
        return out;
    }
    return a.slice(0);
}

var Vec2 = {
    copy : copy
};

module.exports = Vec2;