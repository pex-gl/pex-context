var _Math = {
    PI: Math.PI,
    HALF_PI: Math.PI * 0.5,
    QUARTER_PI: Math.PI * 0.25,
    TWO_PI: Math.PI * 2,
    EPSILON: 2.2204460492503130808472633361816E-16,

    lerp: function (a, b, v) {
        return a + (b - a) * v;
    },

    lerp3 : function(a, b, c, v){
        return a + (b - a) * v + (c - b) * v;
    },

    cosIntrpl: function (a, b, v) {
        v = (1 - Math.cos(v * Math.PI)) * 0.5;
        return (a * (1 - v) + b * v);
    },
    cubicIntrpl: function (a, b, c, d, v) {
        var a0, b0, c0, d0, vv;

        vv = v * v;
        a0 = d - c - a + b;
        b0 = a - b - a0;
        c0 = c - a;
        d0 = b;

        return a0 * v * vv + b0 * vv + c0 * v + d0;
    },

    hermiteIntrpl: function (a, b, c, d, v, tension, bias) {
        var v0, v1, v2, v3,
            a0, b0, c0, d0;

        tension = (1.0 - tension) * 0.5;

        var biasp = 1 + bias,
            biasn = 1 - bias;

        v2 = v * v;
        v3 = v2 * v;

        v0 = (b - a) * biasp * tension;
        v0 += (c - b) * biasn * tension;
        v1 = (c - b) * biasp * tension;
        v1 += (d - c) * biasn * tension;

        a0 = 2 * v3 - 3 * v2 + 1;
        b0 = v3 - 2 * v2 + v;
        c0 = v3 - v2;
        d0 = -2 * v3 + 3 * v2;

        return a0 * b + b0 * v0 + c0 * v1 + d0 * c;
    },

    constrain: function () {
        var r;

        switch (arguments.length) {
            case 2:
                arguments[0] = (arguments[0] > arguments[1]) ? arguments[1] : arguments[0];
                break;
            case 3:
                arguments[0] = (arguments[0] > arguments[2]) ? arguments[2] : (arguments[0] < arguments[1]) ? arguments[1] : arguments[0];
                break;
        }

        return arguments[0];
    },

    normalize: function (value, start, end) {
        return (value - start) / (end - start);
    },
    map: function (value, inStart, inEnd, outStart, outEnd) {
        return outStart + (outEnd - outStart) * this.normalize(value, inStart, inEnd);
    },
    sin: function (value) {
        return Math.sin(value);
    },
    cos: function (value) {
        return Math.cos(value);
    },
    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    saw: function (n) {
        return 2 * (n - Math.floor(0.5 + n));
    },
    tri: function (n) {
        return 1 - 4 * Math.abs(0.5 - this.frac(0.5 * n + 0.25));
    },
    rect: function (n) {
        var a = Math.abs(n);
        return (a > 0.5) ? 0 : (a == 0.5) ? 0.5 : (a < 0.5) ? 1 : -1;
    },
    frac: function (n) {
        return n - Math.floor(n);
    },
    sgn: function (n) {
        return n / Math.abs(n);
    },
    abs: function (n) {
        return Math.abs(n);
    },
    min: function (n) {
        return Math.min(n);
    },
    max: function (n) {
        return Math.max(n);
    },
    atan: function (n) {
        return Math.atan(n);
    },
    atan2: function (y, x) {
        return Math.atan2(y, x);
    },
    round: function (n) {
        return Math.round(n);
    },
    floor: function (n) {
        return Math.floor(n);
    },
    tan: function (n) {
        return Math.tan(n);
    },
    rad2deg: function (radians) {
        return radians * (180 / Math.PI);
    },
    deg2rad: function (degree) {
        return degree * (Math.PI / 180);
    },
    sqrt: function (value) {
        return Math.sqrt(value);
    },
    GreatestCommonDivisor: function (a, b) {
        return (b == 0) ? a : this.GreatestCommonDivisor(b, a % b);
    },
    isFloatEqual: function (a, b) {
        return (Math.abs(a - b) < this.EPSILON);
    },
    isPowerOfTwo: function (a) {
        return (a & (a - 1)) == 0;
    },
    swap: function (a, b) {
        var t = a;
        a = b;
        b = a;
    },
    pow: function (x, y) {
        return Math.pow(x, y);
    },
    log: function (n) {
        return Math.log(n);
    },
    cosh: function (n) {
        return (Math.pow(Math.E, n) + Math.pow(Math.E, -n)) * 0.5;
    },
    exp: function (n) {
        return Math.exp(n);
    },
    catmullrom: function (a, b, c, d, i) {
        return a * ((-i + 2) * i - 1) * i * 0.5 +
            b * (((3 * i - 5) * i) * i + 2) * 0.5 +
            c * ((-3 * i + 4) * i + 1) * i * 0.5 +
            d * ((i - 1) * i * i) * 0.5;
    },
    isPOT : function(a){
        return (a&(a-1))==0;
    }
};


module.exports = _Math;