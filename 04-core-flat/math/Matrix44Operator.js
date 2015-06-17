/**
 *
 *
 *  i,j entry
 *  i-th row and j-th column
 *
 *  m00 m01 m02 m03
 *  m10 m11 m12 m13
 *  m20 m21 m22 m23
 *  m30 m31 m32 m33
 *
 *  0,0  0,1  0,2  0,3
 *  1,0  1,1  1,2  1,3
 *  2,0  2,1  2,2  2,3
 *  3,0  3,1  3,2  3,3
 *
 *  i,j
 *  m[0,0] m[0,1] m[0,2] m[0,3]
 *  m[1,0] m[1,1] m[1,2] m[1,3]
 *  m[2,0] m[2,1] m[2,2] m[2,3]
 *  m[3,0] m[3,1] m[3,2] m[3,3]
 *
 *  i
 *  m[ 0] m[ 1] m[ 2] m[ 3]
 *  m[ 4] m[ 5] m[ 6] m[ 7]
 *  m[ 8] m[ 9] m[10] m[11]
 *  m[12] m[13] m[14] m[15]
 *
 *  vs NOT USED column major
 *
 *  m[ 0] m[ 4] m[ 8] m[12]
 *  m[ 1] m[ 5] m[ 9] m[13]
 *  m[ 2] m[ 6] m[10] m[14]
 *  m[ 3] m[ 7] m[11] m[15]
 *
 */

/**
 *  4x4 Matrix representation.
 * @constructor
 */

function Matrix44Wrap(matrix) {
    /**
     * @member {Array} m - The underlying flat data
     */
    this.m = matrix;
}

Matrix44Wrap.prototype.setf = function(m00,m01,m02,m03,
                                   m10,m11,m12,m13,
                                   m20,m21,m22,m23,
                                   m30,m31,m32,m33){
    var m = this.m;
    m[ 0] = m00;m[ 1] = m01;m[ 2] = m02;m[ 3] = m03;
    m[ 4] = m10;m[ 5] = m11;m[ 6] = m12;m[ 7] = m13;
    m[ 8] = m20;m[ 9] = m21;m[10] = m22;m[11] = m23;
    m[12] = m30;m[13] = m31;m[14] = m32;m[15] = m33;
    return this;
};

Matrix44Wrap.prototype.set = function(arr){
    var m = this.m;
    for(var i = 0, l = 16; i < l; ++i){
        m[i] = arr[i];
    }
    return this;
};


/**
 * Convenience method. Sets column data.
 * @param {Number} col
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setColumnf = function(col,x,y,z,w){
    var m = this.m;
    m[col   ] = x;
    m[col+ 4] = y;
    m[col+ 8] = z;
    m[col+12] = w;
    return this;
};

/**
 * Returns an array of column data.
 * @param col
 * @param out
 * @returns {Array}
 */
Matrix44Wrap.prototype.getColumn = function(col,out){
    out = out || new Array(4);
    var m = this.m;

    out[0] = m[col   ];
    out[1] = m[col+ 4];
    out[2] = m[col+ 8];
    out[3] = m[col+12];
    return out;
};

/**
 * Convenience method. Sets row data.
 * @param {Number} row
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRowf = function(row,x,y,z,w){
    row *= 4;
    var m = this.m;
    m[row  ] = x;
    m[row+1] = y;
    m[row+2] = z;
    m[row+3] = w;
    return this;
};

/**
 * Returns an array of row data.
 * @param row
 * @param out
 * @returns {Array}
 */
Matrix44Wrap.prototype.getRow = function(row,out){
    row *= 4;
    out = out || new Array(4);
    var m = this.m;

    out[0] = m[row  ];
    out[1] = m[row+1];
    out[2] = m[row+2];
    out[3] = m[row+3];
    return out;
};

/**
 * Convenience method. Sets data at index.
 * @param {Number} index
 * @param {Number} x
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setIndex = function(index,x){
    this.m[index] = x;
    return this;
};

/**
 * Convenience method. Sets data at column and row.
 * @param {Number} col
 * @param {Number} row
 * @param {Number} x
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setValue = function(col,row,x){
    this.m[this.getIndex(col,row)] = x;
    return this;
};

/**
 * Returns the data index of the specified column and row.
 * @param {Number} col
 * @param {Number} row
 * @returns {Number}
 */

Matrix44Wrap.prototype.getIndex = function(col,row){
    return col + row * 4;
};

/**
 * Returns a  copy of the matrix.
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.copy = function(out){
    return (out || new Matrix44Wrap()).set(this);
};

/**
 * Sets the matrix to identity matrix.
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.identity = function(){
    var m = this.m;
    m[ 1] = m[ 2] = m[ 3] = m[ 4] = m[ 6] = m[ 7] = m[ 8] = m[ 9] = m[11] = m[12] = m[13] = m[14] =0;
    m[ 0] = m[ 5] = m[10] = m[15] = 1;
    return this;
};

/**
 * Sets the axes scale values. Replaces previous values.
 * Does not reset to identity matrix.
 * @param x
 * @param y
 * @param z
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setScalef = function(x,y,z){
    var m = this.m;

    m[ 0] = x;
    m[ 5] = y;
    m[10] = z;

    return this;
};

Matrix44Wrap.prototype.scalef = function(x,y,z){
    return this.multf(x,0,0,0,
        0,y,0,0,
        0,0,z,0,
        0,0,0,1);
};

Matrix44Wrap.prototype.scale = function(v){
    return this.scalef(v.x, v.y, v.z);
};

/**
 * Sets the axes translation values. Replaces previous values.
 * Does not reset to identity matrix.
 * @param tx
 * @param ty
 * @param tz
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setTranslationf = function(tx,ty,tz){
    var m = this.m;

    m[12] = tx;
    m[13] = ty;
    m[14] = tz;

    return this;
};

/**
 * Sets the axes translation values. Replaces previous values.
 * Does not reset to identity matrix.
 * @param v
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setTranslation = function(v){
    var m = this.m;
    m[12] = v.x;
    m[13] = v.y;
    m[14] = v.z;
    return this;
};

/**
 * Translates the matrix.
 * @param x
 * @param y
 * @param z
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.translatef = function(x,y,z){
    return this.multf(1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        x,y,z,1);
};


Matrix44Wrap.prototype.translate = function(v){
    return this.translatef(v.x, v.y, v.z);
};

/**
 * Sets the x axes rotation. Replaces previous values.
 * Does not reset to identity matrix.
 * @param a
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationX = function(a){
    var m = this.m;

    var sin = Math.sin(a),
        cos = Math.cos(a);

    // row 2
    m[ 5] = cos;
    m[ 6] = -sin;
    // row 3
    m[ 9] = sin;
    m[10] = cos;

    return this;
};

/**
 * Rotates the matrix on the x axis.
 * @param a
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.rotateX = function(a){
    var sin = Math.sin(a),
        cos = Math.cos(a);
    return this.multf(1, 0,   0,   0,
        0, cos,-sin, 0,
        0, sin, cos, 0,
        0, 0,   0,   1);
};

/**
 * Sets the y axes rotation. Replaces previous values.
 * Does not reset to identity matrix.
 * @param a
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationY = function(a){
    var m = this.m;

    var sin = Math.sin(a),
        cos = Math.cos(a);

    // row 1
    m[0] = cos;
    m[2] = sin;
    // row 3
    m[8] = -sin;
    m[10] = cos;

    return this;
};

/**
 * Rotates the matrix on the y axis.
 * @param a
 * @returns {*}
 */

Matrix44Wrap.prototype.rotateY = function(a){
    var sin = Math.sin(a),
        cos = Math.cos(a);
    return this.multf(cos,  0, sin, 0,
        0,    1, 0,   0,
        -sin, 0, cos, 0,
        0,    0, 0,   1);

};

/**
 * Sets the z axes rotation. Replaces previous values.
 * Does not reset to identity matrix.
 * @param a
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationZ = function(a){
    var m = this.m;

    var sin = Math.sin(a),
        cos = Math.cos(a);

    // row 1
    m[0] = cos;
    m[1] = sin;
    // row 3
    m[4] = -sin;
    m[5] = cos;

    return this;
};

Matrix44Wrap.prototype.rotateZ = function(a){
    var sin = Math.sin(a),
        cos = Math.cos(a);
    return this.multf( cos,sin,0,0,
        -sin,cos,0,0,
        0,  0,  1,0,
        0,  0,  0,1);
};

/**
 * Sets a rotation from axes rotations. Replaces previous values.
 * Does not reset to identity matrix.
 * @param ax
 * @param ay
 * @param az
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationf = function(ax,ay,az){
    var m = this.m;

    var cosx = Math.cos(ax),
        sinx = Math.sin(ax),
        cosy = Math.cos(ay),
        siny = Math.sin(ay),
        cosz = Math.cos(az),
        sinz = Math.sin(az);

    // row 1
    m[ 0] = cosy * cosz;
    m[ 1] = -cosx * sinz + sinx * siny * cosz;
    m[ 2] = sinx * sinz + cosx * siny * cosz;

    // row 2
    m[ 4] = cosy * sinz;
    m[ 5] = cosx * cosz + sinx * siny * sinz;
    m[ 6] = -sinx * cosz + cosx * siny * sinz;

    // row3
    m[ 8] = -siny;
    m[ 9] = sinx * cosy;
    m[10] = cosx * cosy;


    return this;
};

/**
 * Rotates the matrix.
 * @param ax
 * @param ay
 * @param az
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.rotatef = function(ax,ay,az){
    var cosx = Math.cos(ax),
        sinx = Math.sin(ax),
        cosy = Math.cos(ay),
        siny = Math.sin(ay),
        cosz = Math.cos(az),
        sinz = Math.sin(az);

    var m00 = cosy * cosz,
        m01 = -cosx * sinz + sinx * siny * cosz,
        m02 = sinx * sinz + cosx * siny * cosz;
    var m10 = cosy * sinz,
        m11 = cosx * cosz + sinx * siny * sinz,
        m12 = -sinx * cosz + cosx * siny * sinz;
    var m20 = -siny,
        m21 = sinx * cosy,
        m22 = cosx * cosy;

    return this.multf(m00,m01,m02,0,
        m10,m11,m12,0,
        m20,m21,m22,0,
        0,  0,  0,  1);
};

Matrix44Wrap.prototype.rotate = function(v){
    return this.rotatef(v.x, v.y, v.z);
};

/**
 * Sets a rotation from axes rotations. Replaces previous values.
 * Does not reset to identity matrix.
 * @param x
 * @param y
 * @param z
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationOnAxisf = function(rot,x,y,z){
    var len = Math.sqrt(x * x + y * y + z * z);

    if (Math.sqrt(x * x + y * y + z * z) < 0.0001) {
        return null;
    }

    var m = this.m;

    var s, c, t;
    var a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;


    len = 1 / len;

    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rot);
    c = Math.cos(rot);
    t = 1 - c;

    a00 = a11 = a22 = 1;
    a01 = a02 = a03 = a10 = a12 = a13 = a20 = a21 = a23 = 0;

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    m[0 ] = a00 * b00 + a10 * b01 + a20 * b02;
    m[1 ] = a01 * b00 + a11 * b01 + a21 * b02;
    m[2 ] = a02 * b00 + a12 * b01 + a22 * b02;
    m[3 ] = a03 * b00 + a13 * b01 + a23 * b02;
    m[4 ] = a00 * b10 + a10 * b11 + a20 * b12;
    m[5 ] = a01 * b10 + a11 * b11 + a21 * b12;
    m[6 ] = a02 * b10 + a12 * b11 + a22 * b12;
    m[7 ] = a03 * b10 + a13 * b11 + a23 * b12;
    m[8 ] = a00 * b20 + a10 * b21 + a20 * b22;
    m[9 ] = a01 * b20 + a11 * b21 + a21 * b22;
    m[10] = a02 * b20 + a12 * b21 + a22 * b22;
    m[11] = a03 * b20 + a13 * b21 + a23 * b22;

    return this;
};

Matrix44Wrap.prototype.rotateFromAxisf = function(rot,x,y,z){
    var len = Math.sqrt(x * x + y * y + z * z);

    if (Math.sqrt(x * x + y * y + z * z) < 0.0001) {
        return null;
    }

    var m = this.m;

    var s, c, t;
    var a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;


    len = 1 / len;

    x *= len;
    y *= len;
    z *= len;

    s = Math.sin(rot);
    c = Math.cos(rot);
    t = 1 - c;

    a00 = a11 = a22 = 1;
    a01 = a02 = a03 = a10 = a12 = a13 = a20 = a21 = a23 = 0;

    b00 = x * x * t + c;
    b01 = y * x * t + z * s;
    b02 = z * x * t - y * s;
    b10 = x * y * t - z * s;
    b11 = y * y * t + c;
    b12 = z * y * t + x * s;
    b20 = x * z * t + y * s;
    b21 = y * z * t - x * s;
    b22 = z * z * t + c;

    var m00 = a00 * b00 + a10 * b01 + a20 * b02,
        m01 = a01 * b00 + a11 * b01 + a21 * b02,
        m02 = a02 * b00 + a12 * b01 + a22 * b02,
        m03 = a03 * b00 + a13 * b01 + a23 * b02;
    var m10 = a00 * b10 + a10 * b11 + a20 * b12,
        m11 = a01 * b10 + a11 * b11 + a21 * b12,
        m12 = a02 * b10 + a12 * b11 + a22 * b12,
        m13 = a03 * b10 + a13 * b11 + a23 * b12;
    var m20 = a00 * b20 + a10 * b21 + a20 * b22,
        m21 = a01 * b20 + a11 * b21 + a21 * b22,
        m22 = a02 * b20 + a12 * b21 + a22 * b22,
        m23 = a03 * b20 + a13 * b21 + a23 * b22;

    return this.multf(m00,m01,m02,m03,
        m10,m11,m12,m13,
        m20,m21,m22,m23,
        0,  0,  0,  1   );
}

/**
 * Rotates matrix from orthonormal base.
 * @param u
 * @param v
 * @param w
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.setRotationFromOnB = function(u,v,w){
    var m = this.m;

    m[ 0] = u.x;
    m[ 1] = u.y;
    m[ 2] = u.z;

    m[ 4] = v.x;
    m[ 5] = v.y;
    m[ 6] = v.z;

    m[ 8] = w.x;
    m[ 9] = w.y;
    m[10] = w.z;

    return this;
};

/**
 * Rotates from orthonormal base.
 * @param u
 * @param v
 * @param w
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.rotateFromOnB = function(u,v,w){
    return this.multf(u.x, u.y, u.z, 0,
        v.x, v.y, v.z, 0,
        w.x, w.y, w.z, 0,
        0,   0,   0,   1);
};

/**
 * Multiplies the matrix with another matrix.
 * @param matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.mult = function(matrix) {
    var m  = this.m,
        m_ = matrix;

    var m_00 = m_[ 0], m_01 = m_[ 1], m_02 = m_[ 2], m_03 = m_[ 3],
        m_10 = m_[ 4], m_11 = m_[ 5], m_12 = m_[ 6], m_13 = m_[ 7],
        m_20 = m_[ 8], m_21 = m_[ 9], m_22 = m_[10], m_23 = m_[11],
        m_30 = m_[12], m_31 = m_[13], m_32 = m_[14], m_33 = m_[15];
    var m00 = m[ 0], m01 = m[ 1], m02 = m[ 2], m03 = m[ 3],
        m10 = m[ 4], m11 = m[ 5], m12 = m[ 6], m13 = m[ 7],
        m20 = m[ 8], m21 = m[ 9], m22 = m[10], m23 = m[11],
        m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];


    m[ 0] = (m_00 * m00) + (m_01 * m10) + (m_02 * m20) + (m_03 * m30);
    m[ 1] = (m_00 * m01) + (m_01 * m11) + (m_02 * m21) + (m_03 * m31);
    m[ 2] = (m_00 * m02) + (m_01 * m12) + (m_02 * m22) + (m_03 * m32);
    m[ 3] = (m_00 * m03) + (m_01 * m13) + (m_02 * m23) + (m_03 * m33);

    m[ 4] = (m_10 * m00) + (m_11 * m10) + (m_12 * m20) + (m_13 * m30);
    m[ 5] = (m_10 * m01) + (m_11 * m11) + (m_12 * m21) + (m_13 * m31);
    m[ 6] = (m_10 * m02) + (m_11 * m12) + (m_12 * m22) + (m_13 * m32);
    m[ 7] = (m_10 * m03) + (m_11 * m13) + (m_12 * m23) + (m_13 * m33);

    m[ 8] = (m_20 * m00) + (m_21 * m10) + (m_22 * m20) + (m_23 * m30);
    m[ 9] = (m_20 * m01) + (m_21 * m11) + (m_22 * m21) + (m_23 * m31);
    m[10] = (m_20 * m02) + (m_21 * m12) + (m_22 * m22) + (m_23 * m32);
    m[11] = (m_20 * m03) + (m_21 * m13) + (m_22 * m23) + (m_23 * m33);

    m[12] = (m_30 * m00) + (m_31 * m10) + (m_32 * m20) + (m_33 * m30);
    m[13] = (m_30 * m01) + (m_31 * m11) + (m_32 * m21) + (m_33 * m31);
    m[14] = (m_30 * m02) + (m_31 * m12) + (m_32 * m22) + (m_33 * m32);
    m[15] = (m_30 * m03) + (m_31 * m13) + (m_32 * m23) + (m_33 * m33);
    return this;
};

Matrix44Wrap.prototype.multf = function(m00,m01,m02,m03,
                                    m10,m11,m12,m13,
                                    m20,m21,m22,m23,
                                    m30,m31,m32,m33){
    var m = this.m;
    var m_00 = m[ 0], m_01 = m[ 1], m_02 = m[ 2], m_03 = m[ 3],
        m_10 = m[ 4], m_11 = m[ 5], m_12 = m[ 6], m_13 = m[ 7],
        m_20 = m[ 8], m_21 = m[ 9], m_22 = m[10], m_23 = m[11],
        m_30 = m[12], m_31 = m[13], m_32 = m[14], m_33 = m[15];

    m[ 0] = (m00 * m_00) + (m01 * m_10) + (m02 * m_20) + (m03 * m_30);
    m[ 1] = (m00 * m_01) + (m01 * m_11) + (m02 * m_21) + (m03 * m_31);
    m[ 2] = (m00 * m_02) + (m01 * m_12) + (m02 * m_22) + (m03 * m_32);
    m[ 3] = (m00 * m_03) + (m01 * m_13) + (m02 * m_23) + (m03 * m_33);

    m[ 4] = (m10 * m_00) + (m11 * m_10) + (m12 * m_20) + (m13 * m_30);
    m[ 5] = (m10 * m_01) + (m11 * m_11) + (m12 * m_21) + (m13 * m_31);
    m[ 6] = (m10 * m_02) + (m11 * m_12) + (m12 * m_22) + (m13 * m_32);
    m[ 7] = (m10 * m_03) + (m11 * m_13) + (m12 * m_23) + (m13 * m_33);

    m[ 8] = (m20 * m_00) + (m21 * m_10) + (m22 * m_20) + (m23 * m_30);
    m[ 9] = (m20 * m_01) + (m21 * m_11) + (m22 * m_21) + (m23 * m_31);
    m[10] = (m20 * m_02) + (m21 * m_12) + (m22 * m_22) + (m23 * m_32);
    m[11] = (m20 * m_03) + (m21 * m_13) + (m22 * m_23) + (m23 * m_33);

    m[12] = (m30 * m_00) + (m31 * m_10) + (m32 * m_20) + (m33 * m_30);
    m[13] = (m30 * m_01) + (m31 * m_11) + (m32 * m_21) + (m33 * m_31);
    m[14] = (m30 * m_02) + (m31 * m_12) + (m32 * m_22) + (m33 * m_32);
    m[15] = (m30 * m_03) + (m31 * m_13) + (m32 * m_23) + (m33 * m_33);

    return this;
};

/**
 * Inverts the matrix.
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.invert = function() {
    var m = this.m;
    var det;
    var m00 = m[ 0], m10 = m[ 1], m20 = m[ 2], m30 = m[ 3],
        m01 = m[ 4], m11 = m[ 5], m21 = m[ 6], m31 = m[ 7],
        m02 = m[ 8], m12 = m[ 9], m22 = m[10], m32 = m[11],
        m03 = m[12], m13 = m[13], m23 = m[14], m33 = m[15];

    //TODO: add caching

    m[ 0] = m11 * m22 * m33 -
    m11 * m32 * m23 -
    m12 * m21 * m33 +
    m12 * m31 * m23 +
    m13 * m21 * m32 -
    m13 * m31 * m22;

    m[ 4] = -m01 * m22 * m33 +
    m01 * m32 * m23 +
    m02 * m21 * m33 -
    m02 * m31 * m23 -
    m03 * m21 * m32 +
    m03 * m31 * m22;

    m[ 8] = m01 * m12 * m33 -
    m01 * m32 * m13 -
    m02 * m11 * m33 +
    m02 * m31 * m13 +
    m03 * m11 * m32 -
    m03 * m31 * m12;

    m[12] = -m01 * m12 * m23 +
    m01 * m22 * m13 +
    m02 * m11 * m23 -
    m02 * m21 * m13 -
    m03 * m11 * m22 +
    m03 * m21 * m12;

    m[ 1] = -m10 * m22 * m33 +
    m10 * m32 * m23 +
    m12 * m20 * m33 -
    m12 * m30 * m23 -
    m13 * m20 * m32 +
    m13 * m30 * m22;

    m[ 5] = m00 * m22 * m33 -
    m00 * m32 * m23 -
    m02 * m20 * m33 +
    m02 * m30 * m23 +
    m03 * m20 * m32 -
    m03 * m30 * m22;

    m[ 9] = -m00 * m12 * m33 +
    m00 * m32 * m13 +
    m02 * m10 * m33 -
    m02 * m30 * m13 -
    m03 * m10 * m32 +
    m03 * m30 * m12;

    m[13] = m00 * m12 * m23 -
    m00 * m22 * m13 -
    m02 * m10 * m23 +
    m02 * m20 * m13 +
    m03 * m10 * m22 -
    m03 * m20 * m12;

    m[ 2] = m10 * m21 * m33 -
    m10 * m31 * m23 -
    m11 * m20 * m33 +
    m11 * m30 * m23 +
    m13 * m20 * m31 -
    m13 * m30 * m21;

    m[ 6] = -m00 * m21 * m33 +
    m00 * m31 * m23 +
    m01 * m20 * m33 -
    m01 * m30 * m23 -
    m03 * m20 * m31 +
    m03 * m30 * m21;

    m[10] = m00 * m11 * m33 -
    m00 * m31 * m13 -
    m01 * m10 * m33 +
    m01 * m30 * m13 +
    m03 * m10 * m31 -
    m03 * m30 * m11;

    m[14] = -m00 * m11 * m23 +
    m00 * m21 * m13 +
    m01 * m10 * m23 -
    m01 * m20 * m13 -
    m03 * m10 * m21 +
    m03 * m20 * m11;

    m[ 3] = -m10 * m21 * m32 +
    m10 * m31 * m22 +
    m11 * m20 * m32 -
    m11 * m30 * m22 -
    m12 * m20 * m31 +
    m12 * m30 * m21;

    m[ 7] = m00 * m21 * m32 -
    m00 * m31 * m22 -
    m01 * m20 * m32 +
    m01 * m30 * m22 +
    m02 * m20 * m31 -
    m02 * m30 * m21;

    m[11] = -m00 * m11 * m32 +
    m00 * m31 * m12 +
    m01 * m10 * m32 -
    m01 * m30 * m12 -
    m02 * m10 * m31 +
    m02 * m30 * m11;

    m[15] = m00 * m11 * m22 -
    m00 * m21 * m12 -
    m01 * m10 * m22 +
    m01 * m20 * m12 +
    m02 * m10 * m21 -
    m02 * m20 * m11;

    det = m00 * m[0] + m10 * m[4] + m20 * m[8] + m30 * m[12];

    if (det == 0){
        return null;
    }

    det = 1.0 / det;

    m[ 0] *= det; m[ 1] *= det; m[ 2] *= det; m[ 3] *= det;
    m[ 4] *= det; m[ 5] *= det; m[ 6] *= det; m[ 7] *= det;
    m[ 8] *= det; m[ 9] *= det; m[10] *= det; m[11] *= det;
    m[12] *= det; m[13] *= det; m[14] *= det; m[15] *= det;

    return this;
};

/**
 * Transposes the matrix.
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.transpose = function () {
    var m = this.m;
    var m01 = m[ 1], m02 = m[ 2], m03 = m[ 3],
        m12 = m[6], m13 = m[7],
        m20 = m[ 8], m21 = m[ 9], m23 = m[11],
        m30 = m[12], m31 = m[13], m32 = m[14];

    //1st row - keeping m00
    m[ 1] = m[ 4]; m[ 2] = m20; m[ 3] = m30;
    //2nd row - keeping m11
    m[ 4] = m01; m[ 6] = m21; m[ 7] = m31;
    //3rd row - keeping m22
    m[ 8] = m02; m[ 9] = m12; m[11] = m32;
    //4th row - keeping m33
    m[12] = m03; m[13] = m13; m[14] = m23;

    return this;
};

Matrix44Wrap.prototype.multVec3 = function(v) {
    var m = this.m;
    var x = v.x, y = v.y, z = v.z;

    v.x = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
    v.y = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
    v.z = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];

    return v;
};

Matrix44Wrap.prototype.multVec3A = function (a, i) {
    var m = this.m;
    i *= 3;

    var x = a[i  ], y = a[i + 1], z = a[i + 2];

    a[i    ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
    a[i + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
    a[i + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
};

Matrix44Wrap.prototype.multVec3AI = function (a, i) {
    var m = this.m;
    var x = a[i    ],
        y = a[i + 1],
        z = a[i + 2];

    a[i  ]   = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12];
    a[i + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13];
    a[i + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14];
};

Matrix44Wrap.prototype.multVec3Arr = function(arr,offset){
    offset = offset || 0 - 1;

    var m = this.m;
    var m00 = m[ 0], m01 = m[ 1], m02 = m[ 2],
        m04 = m[ 4], m05 = m[ 5], m06 = m[ 6],
        m08 = m[ 8], m09 = m[ 9], m10 = m[10],
        m12 = m[12], m13 = m[13], m14 = m[14];

    var vec3, x, y,z;

    var l = arr.length;
    while(++offset < l){
        vec3 = arr[offset];
        x = vec3.x;
        y = vec3.y;
        z = vec3.z;

        vec3.x = m00 * x + m04 * y + m08 * z + m12;
        vec3.y = m01 * x + m05 * y + m09 * z + m13;
        vec3.z = m02 * x + m06 * y + m10 * z + m14;
    }
};

Matrix44Wrap.prototype.multVec3AArr = function(arr,offset){
    offset = offset || 0;

    var m = this.m;
    var m00 = m[ 0],
        m01 = m[ 1],
        m02 = m[ 2],
        m04 = m[ 4],
        m05 = m[ 5],
        m06 = m[ 6],
        m08 = m[ 8],
        m09 = m[ 9],
        m10 = m[10],
        m12 = m[12],
        m13 = m[13],
        m14 = m[14];

    var x, y, z;
    var l = arr.length;
    while(offset < l){
        x = arr[offset    ];
        y = arr[offset + 1];
        z = arr[offset + 2];

        arr[offset    ] = m00 * x + m04 * y + m08 * z + m12;
        arr[offset + 1] = m01 * x + m05 * y + m09 * z + m13;
        arr[offset + 2] = m02 * x + m06 * y + m10 * z + m14;

        offset += 3;
    }
};

Matrix44Wrap.prototype.multVec4 = function (v) {
    var m = this.m;
    var x = v.x,
        y = v.y,
        z = v.z,
        w = v.w;

    v[0] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
    v[1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
    v[2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
    v[3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;

    return v;
};

Matrix44Wrap.prototype.multVec4A = function (a, i) {
    var m = this.m;
    i *= 3;

    var x = a[i  ],
        y = a[i + 1],
        z = a[i + 2],
        w = a[i + 3];

    a[i    ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
    a[i + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
    a[i + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
    a[i + 3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;
};

Matrix44Wrap.prototype.multVec4AI = function (a, i) {
    var m = this.m;
    var x = a[i  ],
        y = a[i + 1],
        z = a[i + 2],
        w = a[i + 3];

    a[i    ] = m[ 0] * x + m[ 4] * y + m[ 8] * z + m[12] * w;
    a[i + 1] = m[ 1] * x + m[ 5] * y + m[ 9] * z + m[13] * w;
    a[i + 2] = m[ 2] * x + m[ 6] * y + m[10] * z + m[14] * w;
    a[i + 3] = m[ 3] * x + m[ 7] * y + m[11] * z + m[15] * w;
};

/**
 * Returns a multiplied copy of the matrix.
 * @param {Matrix44Wrap} matrix
 * @param {Matrix44Wrap} [out] - Optional out
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.multiplied = function(matrix,out){
    var m = this.m;
    if(m.byteLength !== undefined){
        if(out.byteLength === undefined){
            throw new Error('Out argument is of wrong type.');
        }
        out.set(m);
        return out;
    }
    for(var i = 0, l = 16; i < l; ++i){
        out[i] = m[i];
    }
    MatrixOperator(out).set(m).mult(matrix);
    return out;
};


/**
 * Returns an inverted copy of the matrix.
 * @param {Matrix44Wrap} [out] - Optional out
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.inverted = function(out){
    return (out || new Matrix44Wrap()).set(this).invert();
};

/**
 * Returns a transposed copy of the matrix.
 * @param {Matrix44Wrap} [out] - Optional out
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.prototype.transposed = function(out){
    return (out || new Matrix44Wrap()).set(this).transpose();
};

///**
// * Returns
// * @param out
// */
//
//Matrix44Wrap.prototype.toRotationMatrix = function(out){
//    out = out || new Matrix44Wrap();
//    var m = out.m,
//        m_= this.m;
//    m[0] = m_[0];m[0] = m_[0];
//
//};


Matrix44Wrap.prototype.columnToString = function(col){
    var m = this.m;
    return m[col   ] + '\n' +
        m[col+ 4] + '\n' +
        m[col+ 8] + '\n' +
        m[col+14] + '\n';
};

Matrix44Wrap.prototype.rowToString = function(row){
    var m = this.m;
    return m[row] + ', ' + m[row+1] + ', ' + m[row+2] + ', ' + m[row+3];
};

/**
 * Returns a string representation of the matrix.
 * @returns {string}
 */

Matrix44Wrap.prototype.toString = function(){
    var m = this.m;
    return m[ 0] + ', ' + m[ 1] + ', ' + m[ 2] + ', ' + m[ 3] + '\n' +
        m[ 4] + ', ' + m[ 5] + ', ' + m[ 6] + ', ' + m[ 7] + '\n' +
        m[ 8] + ', ' + m[ 9] + ', ' + m[10] + ', ' + m[11] + '\n' +
        m[12] + ', ' + m[13] + ', ' + m[14] + ', ' + m[15];

};

/**
 * Returns a new scale matrix.
 * @param {Number} sx
 * @param {Number} sy
 * @param {Number} sz
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromScale = function(sx, sy, sz, out){
    return (out || new Matrix44Wrap()).setScalef(sx,sy,sz);
};

/**
 * Returns a new scale matrix.
 * @param {Number} sx
 * @param {Number} sy
 * @param {Number} sz
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromScalef = Matrix44Wrap.fromScale;

/**
 * Returns a new translation matrix.
 * @param {Number} tx
 * @param {Number} ty
 * @param {Number} tz
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromTranslation = function(tx, ty, tz, out){
    return (out || new Matrix44Wrap()).setTranslationf(tx,ty,tz);
};

/**
 * Returns a new x rotation matrix.
 * @param {Number} a
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromRotationX = function (a, out) {
    return (out || new Matrix44Wrap()).setRotationX(a);
};

/**
 * Returns a new y rotation matrix.
 * @param {Number} a
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromRotationY = function (a, out) {
    return (out || new Matrix44Wrap()).setRotationY(a);
};

/**
 * Returns a new z rotation matrix.
 * @param {Number} a
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {*|Matrix44Wrap}
 */

Matrix44Wrap.fromRotationZ = function (a, out) {
    return (out || new Matrix44Wrap()).setRotationZ(a);
};

/**
 * Returns a new rotation matrix.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromRotation = function (x, y, z, out) {
    return (out || new Matrix44Wrap()).setRotationf(x,y,z);
};

/**
 * Returns a new axis aligned rotation.
 * @param rot
 * @param x
 * @param y
 * @param z
 * @param {Matrix44Wrap} [out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromRotationOnAxis = function (rot, x, y, z, out) {
    return (out || new Matrix44Wrap()).setRotationOnAxisf(rot,x,y,z);
};

/**
 * Returns a rotation matrix from an orthonormal basis
 * @param u
 * @param v
 * @param w
 * @param {Matrix44Wrap}[out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromOnBAxes = function(u,v,w,out){
    return (out || new Matrix44Wrap()).setRotationFromOnB(u,v,w);
};

/**
 * Returns a rotation matrix from an orthonormal basis
 * @param {OnB}onb
 * @param {Matrix44Wrap}[out] - Optional out, expects identity matrix
 * @returns {Matrix44Wrap}
 */

Matrix44Wrap.fromOnB = function(onb,out){
    return Matrix44Wrap.fromOnBAxes(onb.u,onb.v,onb.w,out);
};


Matrix44Wrap.prototype.lookAtf = function(eyex,eyey,eyez,targetx,targety,targetz,upx,upy,upz){
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    var m = this.m;

    if (Math.abs(eyex - targetx) < 0.000001 &&
        Math.abs(eyey - targety) < 0.000001 &&
        Math.abs(eyez - targetz) < 0.000001) {

        m[ 0] = 1;
        m[ 1] = m[ 2] = m[ 3] = 0;
        m[ 5] = 1;
        m[ 4] = m[ 6] = m[ 7] = 0;
        m[10] = 1;
        m[ 8] = m[ 9] = m[11] = 0;
        m[15] = 1;
        m[12] = m[13] = m[14] = 0;

        return;
    }

    z0 = eyex - targetx;
    z1 = eyey - targety;
    z2 = eyez - targetz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;

    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);

    if(len){
        len = 1.0 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);

    if(len){
        len = 1.0 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }


    m[ 0] = x0;m[ 1] = y0;m[ 2] = z0;m[ 3] = 0;
    m[ 4] = x1;m[ 5] = y1;m[ 6] = z1;m[ 7] = 0;
    m[ 8] = x2;m[ 9] = y2;m[10] = z2;m[11] = 0;

    m[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    m[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    m[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    m[15] = 1;

    return this;
};

Matrix44Wrap.prototype.lookAt = function(eye,target,up){
    return this.lookAtf(eye.x,eye.y,eye.z,
        target.x,target.y,target.z,
        up.x,up.y,up.z);
};

Matrix44Wrap.fromLookAt = function(eye,target,up){
    return new Matrix44Wrap().lookAt(eye,target,up);
};


Matrix44Wrap.prototype.out = function(){
    return this.m;
};

function MatrixOperator(matrix){
    return new Matrix44Wrap(matrix);
}

module.exports = MatrixOperator;

