var Vec2 = require('./Vec2');

/*
 *
 * 0,1,2,
 * 3,4,5,
 * 6,7,8
 *
 */

function Matrix33(){
    this.m = [1,0,0,
              0,1,0,
              0,0,1];
}

Matrix33.prototype.identity = function(){
    var m = this.m;
    m[0] = m[4] = m[8] = 1;
    m[1] = m[2] = m[3] = m[5] = m[6] = m[7] = 0;
};

Matrix33.prototype.set = function(matrix){
    var m, m_;

    m  = this.m;
    m_ = matrix.m;

    m[0] = m_[0]; m[1] = m_[1]; m[2] = m_[2];
    m[3] = m_[3]; m[4] = m_[4]; m[5] = m_[5];
    m[6] = m_[6]; m[7] = m_[7]; m[8] = m_[8];
    return this;
};

Matrix33.prototype.setf = function(m00,m01,m02,
                                   m10,m11,m12,
                                   m20,m21,m22){
    var m = this.m;
    m[0] = m00; m[1] = m01; m[2] = m02;
    m[3] = m10; m[4] = m11; m[5] = m12;
    m[6] = m20; m[7] = m21; m[8] = m22;
    return this;
};

Matrix33.prototype.setFromScale = function(scale){
    var m = this.m;

    m[0] = scale.x;
    m[4] = scale.y;

    m[1] = m[2] = m[3] = m[5] = m[6] = m[7] = 0;
    m[8] = 1;

    return this;
};

Matrix33.prototype.setFromScalef = function(x,y){
    var m = this.m;

    m[0] = x;
    m[4] = y;

    m[1] = m[2] = m[3] = m[5] = m[6] = m[7] = 0;
    m[8] = 1;

    return this;
};

Matrix33.prototype.setFromRotation = function(angle){
    var m, cs, ss;

    m  = this.m;
    cs = Math.cos(angle);
    ss = Math.sin(angle);

    m[0] =  cs;
    m[1] =  ss;
    m[3] = -ss;
    m[4] =  cs;

    m[2] = m[5] = m[6] = m[7] = 0;
    m[8] = 1.0;

    return this;
};

Matrix33.prototype.setFromTranslationf = function(x,y){
    var m = this.m;

    m[0] = m[4] = m[8] = 1;
    m[1] = m[3] = m[6] = m[7]
};

Matrix33.prototype.multVec2f = function(x,y,out){
    out = out || new Vec2();
    var m = this.m;

    out.x = x * m[0] + y * m[1] + m[2];
    out.y = x * m[3] + y * m[4] + m[5];
    return out;
};

Matrix33.prototype.multVec2 = function(v,out){
    out = out || v;
    var m,x,y;

    m = this.m;
    x = v.x;
    y = v.y;

    out.x = x * m[0] + y * m[1] + m[2];
    out.y = x * m[3] + y * m[4] + m[5];
    return out;
};

Matrix33.prototype.invert = function(){
    var m, m00, m01, m02, m10, m11, m12, m20, m21, m22,
        m01_, m11_, m21_, det;

    m = this.m;
    m00 = m[0]; m01 = m[1]; m02 = m[2];
    m10 = m[3]; m11 = m[4]; m12 = m[5];
    m20 = m[6]; m21 = m[7]; m22 = m[8];


    m01_ =  m22 * m11 - m12 * m21;
    m11_ = -m22 * m10 + m12 * m20;
    m21_ =  m21 * m10 - m11 * m20;

    det = 1.0 / (m00 * m01_ + m01 * m11_ + m02 * m21_);

    m[0] = m01_ * det;
    m[1] = (-m22 * m01 + m02 * m21) * det;
    m[2] = (m12 * m01 - m02 * m11) * det;
    m[3] = m11_ * det;
    m[4] = (m22 * m00 - m02 * m20) * det;
    m[5] = (-m12 * m00 + m02 * m10) * det;
    m[6] = m21_ * det;
    m[7] = (-m21 * m00 + m01 * m20) * det;
    m[8] = (m11 * m00 - m01 * m10) * det;
    return this;
};

Matrix33.prototype.transpose = function(){
    var m, m1, m2, m5;

    m  = this.m;
    m1 = m[1];
    m2 = m[2];
    m5 = m[5];

    m[1] = m[3];
    m[2] = m[6];
    m[3] = m1;
    m[5] = m[7];
    m[6] = m2;
    m[7] = m5;
    return this;
};

Matrix33.prototype.transposed = function(matrix){
    return (matrix || new Matrix33()).set(this).transpose();
};

Matrix33.prototype.toFloat32Array = function(arr){
    arr = arr || new Float32Array(9);
    arr.set(this.m);
    return arr;
};

module.exports = Matrix33;