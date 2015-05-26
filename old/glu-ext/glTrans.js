var Mat4 = require('pex-geom').Mat4;

var glTrans = {
    stack: [],
    matrix: new Mat4()
};

glTrans.identity = function() {
    this.matrix.identity();
};

glTrans.pushMatrix = function() {
    this.stack.push(this.matrix.dup());
};

glTrans.popMatrix = function() {
    this.matrix = this.stack.pop();
};

glTrans.translate = function(v){
    this.matrix.translate(v.x, v.y, v.z);
};

glTrans.translatef = function(x, y, z) {
    this.matrix.translate(x, y, z);
};

glTrans.rotatef = function(x, y, z) {
    var cosx, sinx, cosy, siny, cosz, sinz;
    var m00,m01,m02;
    var m10,m11,m12;
    var m20,m21,m22;

    cosx = Math.cos(x);
    sinx = Math.sin(x);
    cosy = Math.cos(y);
    siny = Math.sin(y);
    cosz = Math.cos(z);
    sinz = Math.sin(z);

    m00 = cosy * cosz;
    m01 = -cosx * sinz + sinx * siny * cosz;
    m02 = sinx * sinz + cosx * siny * cosz;
    m10 = cosy * sinz;
    m11 = cosx * cosz + sinx * siny * sinz;
    m12 = -sinx * cosz + cosx * siny * sinz;
    m20 = -siny;
    m21 = sinx * cosy;
    m22 = cosx * cosy;

    this.matrix.mul4x4r(
        m00,m10,m20,0,
        m01,m11,m21,0,
        m02,m12,m22,0,
        0,0,0,1
    );

    //this.matrix.rotate(x, 1, 0, 0).rotate(y, 0, 1, 0).rotate(z, 0, 0, 1);
};

glTrans.scale = function(v){
    this.matrix.scale(v.x, v.y, v.z);
};

glTrans.scale3f = function(x, y, z) {
    this.matrix.scale(x, y, z);
};

glTrans.scale1f = function(x) {
    this.matrix.scale(x, x, x);
};

glTrans.mult = function(m){
    this.matrix.mul(m);
};

glTrans.getMatrix = function() {
    return this.matrix;
};

module.exports = glTrans;