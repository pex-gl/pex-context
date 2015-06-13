module.exports = {
    perspective: function (m, fov, aspect, near, far) {
        var f = 1.0 / Math.tan(fov * 0.5),
            nf = 1.0 / (near - far);

        m[ 1] = m[ 2] = m[ 3] = m[ 4] = m[ 6] = m[ 7] = m[ 8] = m[ 9] = m[12] = m[13] = m[15] = 0;

        m[ 0] = f / aspect;
        m[ 5] = f;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[14] = (2 * far * near) * nf;

        return m;

    },

    //http://www.songho.ca/opengl/gl_projectionmatrix.html#ortho
    ortho : function(m, left, right, bottom, top , near, far) {
        var lr = left - right,
            bt = bottom - top,
            nf = near - far;

        m[ 1] = m[ 2] = m[ 3] = m[ 4] = m[ 6] = m[ 7] = m[ 8] = m[ 9] = m[11] = 0;

        m[ 0] = -2 / lr;
        m[ 5] = -2 / bt;
        m[10] =  2 / nf;

        m[12] = (left + right) / lr;
        m[13] = (top + bottom) / bt;
        m[14] = (far + near)  / nf;
        m[15] = 1;

        return m;
    },

    frustum: function (m, left, right, bottom, top, near, far) {
        var rl = 1 / (right - left),
            tb = 1 / (top - bottom),
            nf = 1 / (near - far);


        m[ 0] = (near * 2) * rl;
        m[ 1] = 0;
        m[ 2] = 0;
        m[ 3] = 0;
        m[ 4] = 0;
        m[ 5] = (near * 2) * tb;
        m[ 6] = 0;
        m[ 7] = 0;
        m[ 8] = (right + left) * rl;
        m[ 9] = (top + bottom) * tb;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = (far * near * 2) * nf;
        m[15] = 0;

        return m;
    },

    lookAt : function (m, eyex, eyey, eyez, targetx, targety, targetz, upx, upy, upz) {
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;

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

        m[ 0] = x0;
        m[ 1] = y0;
        m[ 2] = z0;
        m[ 3] = 0;
        m[ 4] = x1;
        m[ 5] = y1;
        m[ 6] = z1;
        m[ 7] = 0;
        m[ 8] = x2;
        m[ 9] = y2;
        m[10] = z2;
        m[11] = 0;
        m[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        m[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        m[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        m[15] = 1;
    }
};