function create(){
    return new Array(
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    );
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

function identity(a){
    a[0] = a[5] = a[10] = a[15] = 1;
    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = a[12] = a[13] = a[14] = 0;
    return a;
}

function perspective(a,fov, aspect, near, far) {
    var f = 1.0 / Math.tan(fov * 0.5);
    var nf = 1.0 / (near - far);

    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[12] = a[13] = a[15] = 0;

    a[0] = f / aspect;
    a[5] = f;
    a[10] = (far + near) * nf;
    a[11] = -1;
    a[14] = (2 * far * near) * nf;

    return a;
}

function ortho(a, left, right, bottom, top , near, far) {
    var lr = left - right;
    var bt = bottom - top;
    var nf = near - far;

    a[1] = a[2] = a[3] = a[4] = a[6] = a[7] = a[8] = a[9] = a[11] = 0;

    a[0] = -2 / lr;
    a[5] = -2 / bt;
    a[10] = 2 / nf;

    a[12] = (left + right) / lr;
    a[13] = (top + bottom) / bt;
    a[14] = (far + near) / nf;
    a[15] = 1;

    return a;
}

var Mat4 = {
    create : create,
    copy : copy,
    identity : identity,
    perspective : perspective,
    ortho : ortho
};

module.exports = Mat4;
