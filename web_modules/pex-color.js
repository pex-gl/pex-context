import { s as setAlpha, l as linearToSrgb, a as srgbToLinear, f as fromHSL, t as toHSL, m, b as minv, o as oklabToLinearSrgb, g as getStMax, T as TMP, c as toe, d as toeInv, e as findCusp, h as luvToXyz, i as luvToLch, x as xyzToLuv, j as lchToLuv, L as L_EPSILON, k as getBounds, n as floorArray } from './_chunks/hsl-E15bvNol.js';
export { p as fromHex, q as toHex, u as utils } from './_chunks/hsl-E15bvNol.js';

/**
 * @typedef {number[]} color An array of 3 (RGB) or 4 (A) values.
 *
 * All components in the range 0 <= x <= 1
 */ /**
 * Creates a new color from linear values.
 * @param {number} [r=0]
 * @param {number} [g=0]
 * @param {number} [b=0]
 * @param {number} [a]
 * @returns {color}
 */ function create(r, g, b, a) {
    if (r === void 0) r = 0;
    if (g === void 0) g = 0;
    if (b === void 0) b = 0;
    if (a === void 0) a = 1;
    return [
        r,
        g,
        b,
        a
    ];
}
/**
 * Returns a copy of a color.
 * @param {color} color
 * @returns {color}
 */ function copy(color) {
    return color.slice();
}
/**
 * Sets a color to another color.
 * @param {color} color
 * @param {color} color2
 * @returns {color}
 */ function set(color, color2) {
    color[0] = color2[0];
    color[1] = color2[1];
    color[2] = color2[2];
    return setAlpha(color, color2[3]);
}
/**
 * Updates a color based on r, g, b, [a] values.
 * @param {import("./color.js").color} color
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromValues(color, r, g, b, a) {
    color[0] = r;
    color[1] = g;
    color[2] = b;
    return setAlpha(color, a);
}
/**
 * @deprecated Use "fromValues()".
 * @ignore
 */ function fromRGB(color, r, g, b, a) {
    console.error(`"fromRGB()" deprecated. Use "fromValues()".`);
    return fromValues(color, r, g, b, a);
}
/**
 * @deprecated Use "set()".
 * @ignore
 */ function toRGB(color, out) {
    if (out === void 0) out = [];
    console.error(`"toRGB()" deprecated. Use "set()".`);
    return set(out, color);
}

/**
 * @typedef {number[]} bytes An array of 3 (RGB) or 4 (A) values in bytes.
 *
 * All components in the range 0 <= x <= 255
 */ /**
 * Updates a color based on byte values.
 * @param {import("./color.js").color} color
 * @param {bytes} bytes
 * @returns {import("./color.js").color}
 */ function fromBytes(color, param) {
    let [r, g, b, a] = param;
    color[0] = r / 255;
    color[1] = g / 255;
    color[2] = b / 255;
    if (a !== undefined) color[3] = a / 255;
    return color;
}
/**
 * Get RGB[A] color components as bytes array.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {bytes}
 */ function toBytes(color, out) {
    if (out === void 0) out = [];
    out[0] = Math.round(color[0] * 255);
    out[1] = Math.round(color[1] * 255);
    out[2] = Math.round(color[2] * 255);
    if (color[3] !== undefined) out[3] = Math.round(color[3] * 255);
    return out;
}
/**
 * @deprecated Use "fromBytes()".
 * @ignore
 */ function fromRGBBytes(color, bytes) {
    console.error(`"fromRGBBytes()" deprecated. Use "fromBytes()".`);
    return fromBytes(color, bytes);
}
/**
 * @deprecated Use "toBytes()".
 * @ignore
 */ function toRGBBytes(color, out) {
    console.error(`"toRGBBytes()" deprecated. Use "toBytes()".`);
    return toBytes(color, out);
}

/**
 * @typedef {number[]} linear r g b linear values.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://en.wikipedia.org/wiki/SRGB}
 */ /**
 * Updates a color based on linear values.
 * @param {import("./color.js").color} color
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromLinear(color, r, g, b, a) {
    color[0] = linearToSrgb(r);
    color[1] = linearToSrgb(g);
    color[2] = linearToSrgb(b);
    return setAlpha(color, a);
}
/**
 * Returns a linear color representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {linear}
 */ function toLinear(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    out[0] = srgbToLinear(r);
    out[1] = srgbToLinear(g);
    out[2] = srgbToLinear(b);
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} hwb hue, whiteness, blackness.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://en.wikipedia.org/wiki/HWB_color_model}
 */ /**
 * Updates a color based on HWB values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} w
 * @param {number} b
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromHWB(color, h, w, b, a) {
    if (w + b >= 1) {
        color[0] = color[1] = color[2] = w / (w + b);
    } else {
        fromHSL(color, h, 1, 0.5);
        for(let i = 0; i < 3; i++){
            color[i] *= 1 - w - b;
            color[i] += w;
        }
    }
    return setAlpha(color, a);
}
/**
 * Returns a HWB representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {hwb}
 */ function toHWB(color, out) {
    if (out === void 0) out = [];
    toHSL(color, out);
    out[1] = Math.min(color[0], color[1], color[2]);
    out[2] = 1 - Math.max(color[0], color[1], color[2]);
    return setAlpha(out, color[3]);
}

/**
 * @typedef {number[]} hsv hue, saturation, value.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://en.wikipedia.org/wiki/HSL_and_HSV}
 */ /**
 * Updates a color based on HSV values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromHSV(color, h, s, v, a) {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch(i % 6){
        case 0:
            color[0] = v;
            color[1] = t;
            color[2] = p;
            break;
        case 1:
            color[0] = q;
            color[1] = v;
            color[2] = p;
            break;
        case 2:
            color[0] = p;
            color[1] = v;
            color[2] = t;
            break;
        case 3:
            color[0] = p;
            color[1] = q;
            color[2] = v;
            break;
        case 4:
            color[0] = t;
            color[1] = p;
            color[2] = v;
            break;
        case 5:
            color[0] = v;
            color[1] = p;
            color[2] = q;
            break;
    }
    return setAlpha(color, a);
}
/**
 * Returns a HSV representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {hsv}
 */ function toHSV(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    out[2] = max;
    const d = max - min;
    out[1] = max === 0 ? 0 : d / max;
    if (max === min) {
        out[0] = 0; // achromatic
    } else {
        switch(max){
            case r:
                out[0] = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                out[0] = (b - r) / d + 2;
                break;
            case b:
                out[0] = (r - g) / d + 4;
                break;
        }
        out[0] /= 6;
    }
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} xyz CIE XYZ using D65 standard illuminant.
 *
 * Components range: 0 <= x <= 0.95; 0 <= y <= 1; 0 <= z <= 1.08;
 * @see {@link https://en.wikipedia.org/wiki/CIE_1931_color_space}
 */ /**
 * Updates a color based on XYZ values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} a
 * @returns {import("./color.js").color}
 */ function fromXYZ(color, x, y, z, a) {
    const r = x * m[0][0] + y * m[0][1] + z * m[0][2];
    const g = x * m[1][0] + y * m[1][1] + z * m[1][2];
    const b = x * m[2][0] + y * m[2][1] + z * m[2][2];
    color[0] = linearToSrgb(r);
    color[1] = linearToSrgb(g);
    color[2] = linearToSrgb(b);
    return setAlpha(color, a);
}
/**
 * Returns a XYZ representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {xyz}
 */ function toXYZ(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    out[0] = lr * minv[0][0] + lg * minv[0][1] + lb * minv[0][2];
    out[1] = lr * minv[1][0] + lg * minv[1][1] + lb * minv[1][2];
    out[2] = lr * minv[2][0] + lg * minv[2][1] + lb * minv[2][2];
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} lab CIELAB with D65 standard illuminant as default.
 *
 * Components range (D65): 0 <= l <= 1; -0.86183 <= a <= 0.98234; -1.0786 <= b <= 0.94478;
 *
 * Components range (D50): 0 <= l <= 1; -0.79287 <= a <= 0.9355; -1.12029 <= b <= 0.93388;
 * @see {@link https://en.wikipedia.org/wiki/CIELAB_color_space}
 */ /**
 * Illuminant D65: x,y,z tristimulus values
 * @private
 * @see {@link https://en.wikipedia.org/wiki/Illuminant_D65}
 */ const D65 = [
    0.3127 / 0.329,
    1,
    (1 - 0.3127 - 0.329) / 0.329
];
const D50 = [
    0.3457 / 0.3585,
    1,
    (1 - 0.3457 - 0.3585) / 0.3585
];
function fromLabValueToXYZValue(val, white) {
    const pow = val ** 3;
    return (pow > 0.008856 ? pow : (val - 16 / 116) / 7.787037) * white;
}
function fromXYZValueToLabValue(val, white) {
    val /= white;
    return val > 0.008856 ? Math.cbrt(val) : 7.787037 * val + 16 / 116;
}
/**
 * Updates a color based on Lab values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} l
 * @param {number} a
 * @param {number} b
 * @param {number} α
 * @param {Array} illuminant
 * @returns {import("./color.js").color}
 */ function fromLab(color, l, a, b, α, illuminant) {
    if (illuminant === void 0) illuminant = D65;
    const y = (l + 0.16) / 1.16;
    return fromXYZ(color, fromLabValueToXYZValue(a / 5 + y, illuminant[0]), fromLabValueToXYZValue(y, illuminant[1]), fromLabValueToXYZValue(y - b / 2, illuminant[2]), α);
}
/**
 * Returns a Lab representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @param {Array} illuminant
 * @returns {lab}
 */ function toLab(color, out, illuminant) {
    if (out === void 0) out = [];
    if (illuminant === void 0) illuminant = D65;
    const xyz = toXYZ(color);
    const x = fromXYZValueToLabValue(xyz[0], illuminant[0]);
    const y = fromXYZValueToLabValue(xyz[1], illuminant[1]);
    const z = fromXYZValueToLabValue(xyz[2], illuminant[2]);
    out[0] = 1.16 * y - 0.16;
    out[1] = 5 * (x - y);
    out[2] = 2 * (y - z);
    return setAlpha(out, color[3]);
}

/**
 * @typedef {number[]} oklab Cartesian form using D65 standard illuminant.
 *
 * Components range: 0 <= l <= 1; -0.233 <= a <= 0.276; -0.311 <= b <= 0.198;
 * @see {@link https://bottosson.github.io/posts/oklab/#converting-from-linear-srgb-to-oklab}
 */ /**
 * @private
 */ function linearSrgbToOklab(color, lr, lg, lb) {
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    color[0] = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    color[1] = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    color[2] = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return color;
}
/**
 * Updates a color based on Oklab values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} L
 * @param {number} a
 * @param {number} b
 * @param {number} [α]
 * @returns {import("./color.js").color}
 */ function fromOklab(color, L, a, b, α) {
    oklabToLinearSrgb(color, L, a, b);
    color[0] = linearToSrgb(color[0]);
    color[1] = linearToSrgb(color[1]);
    color[2] = linearToSrgb(color[2]);
    return setAlpha(color, α);
}
/**
 * Returns an Oklab representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {oklab}
 */ function toOklab(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    linearSrgbToOklab(out, srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} okhsv
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://bottosson.github.io/posts/colorpicker/#hsv-2}
 */ const S0 = 0.5;
/**
 * Updates a color based on Okhsv values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} s
 * @param {number} v
 * @param {number} [α]
 * @returns {import("./color.js").color}
 */ function fromOkhsv(color, h, s, v, α) {
    const a_ = Math.cos(2 * Math.PI * h);
    const b_ = Math.sin(2 * Math.PI * h);
    const [S, T] = getStMax(a_, b_);
    const k = 1 - S0 / S;
    const Lv = 1 - s * S0 / (S0 + T - T * k * s);
    const Cv = s * T * S0 / (S0 + T - T * k * s);
    let L = v * Lv;
    let C = v * Cv;
    const Lvt = toeInv(Lv);
    const Cvt = Cv * Lvt / Lv;
    const Lnew = toeInv(L);
    C = C * Lnew / L;
    L = Lnew;
    oklabToLinearSrgb(TMP, Lvt, a_ * Cvt, b_ * Cvt);
    const scaleL = Math.cbrt(1 / Math.max(TMP[0], TMP[1], TMP[2], 0));
    L = L * scaleL;
    C = C * scaleL;
    fromOklab(color, L, C * a_, C * b_);
    return setAlpha(color, α);
}
/**
 * Returns an Okhsv representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {okhsv}
 */ function toOkhsv(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    linearSrgbToOklab(TMP, srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
    let C = Math.sqrt(TMP[1] * TMP[1] + TMP[2] * TMP[2]);
    const a_ = TMP[1] / C;
    const b_ = TMP[2] / C;
    let L = TMP[0];
    out[0] = 0.5 + 0.5 * Math.atan2(-TMP[2], -TMP[1]) / Math.PI;
    const [S, T] = getStMax(a_, b_);
    const t = T / (C + L * T);
    const Lv = t * L;
    const Cv = t * C;
    const Lvt = toeInv(Lv);
    const Cvt = Cv * Lvt / Lv;
    oklabToLinearSrgb(TMP, Lvt, a_ * Cvt, b_ * Cvt);
    const scaleL = Math.cbrt(1 / Math.max(TMP[0], TMP[1], TMP[2], 0));
    L = L / scaleL;
    C = C / scaleL;
    const toeL = toe(L);
    C = C * toeL / L;
    out[1] = (S0 + T) * Cv / (T * S0 + T * (1 - S0 / S) * Cv);
    out[2] = toeL / Lv;
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} okhsl
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://bottosson.github.io/posts/colorpicker/#hsv-2}
 */ function findGamutIntersection(a, b, L1, C1, L0, cusp) {
    if (cusp === void 0) cusp = null;
    if (!cusp) cusp = findCusp(a, b);
    let t;
    if ((L1 - L0) * cusp[1] - (cusp[0] - L0) * C1 <= 0) {
        t = cusp[1] * L0 / (C1 * cusp[0] + cusp[1] * (L0 - L1));
    } else {
        t = cusp[1] * (L0 - 1) / (C1 * (cusp[0] - 1) + cusp[1] * (L0 - L1));
        const dL = L1 - L0;
        const dC = C1;
        const kl = 0.3963377774 * a + 0.2158037573 * b;
        const km = -0.1055613458 * a - 0.0638541728 * b;
        const ks = -0.0894841775 * a - 1.291485548 * b;
        const l_dt = dL + dC * kl;
        const m_dt = dL + dC * km;
        const s_dt = dL + dC * ks;
        const L = L0 * (1 - t) + t * L1;
        const C = t * C1;
        const l_ = L + C * kl;
        const m_ = L + C * km;
        const s_ = L + C * ks;
        const l = l_ * l_ * l_;
        const m = m_ * m_ * m_;
        const s = s_ * s_ * s_;
        const ldt = 3 * l_dt * l_ * l_;
        const mdt = 3 * m_dt * m_ * m_;
        const sdt = 3 * s_dt * s_ * s_;
        const ldt2 = 6 * l_dt * l_dt * l_;
        const mdt2 = 6 * m_dt * m_dt * m_;
        const sdt2 = 6 * s_dt * s_dt * s_;
        const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s - 1;
        const r1 = 4.0767416621 * ldt - 3.3077115913 * mdt + 0.2309699292 * sdt;
        const r2 = 4.0767416621 * ldt2 - 3.3077115913 * mdt2 + 0.2309699292 * sdt2;
        const ur = r1 / (r1 * r1 - 0.5 * r * r2);
        let tr = -r * ur;
        const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s - 1;
        const g1 = -1.2684380046 * ldt + 2.6097574011 * mdt - 0.3413193965 * sdt;
        const g2 = -1.2684380046 * ldt2 + 2.6097574011 * mdt2 - 0.3413193965 * sdt2;
        const ug = g1 / (g1 * g1 - 0.5 * g * g2);
        let tg = -g * ug;
        const b0 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s - 1;
        const b1 = -0.0041960863 * ldt - 0.7034186147 * mdt + 1.707614701 * sdt;
        const b2 = -0.0041960863 * ldt2 - 0.7034186147 * mdt2 + 1.707614701 * sdt2;
        const ub = b1 / (b1 * b1 - 0.5 * b0 * b2);
        let tb = -b0 * ub;
        tr = ur >= 0 ? tr : 10e5;
        tg = ug >= 0 ? tg : 10e5;
        tb = ub >= 0 ? tb : 10e5;
        t += Math.min(tr, tg, tb);
    }
    return t;
}
function getCs(L, a_, b_) {
    const cusp = findCusp(a_, b_);
    const Cmax = findGamutIntersection(a_, b_, L, 1, L, cusp);
    const STmax = getStMax(a_, b_, cusp);
    // prettier-ignore
    const Smid = 0.11516993 + 1 / (7.44778970 + 4.15901240 * b_ + a_ * (-2.19557347 + 1.75198401 * b_ + a_ * (-2.13704948 - 10.02301043 * b_ + a_ * (-4.24894561 + 5.38770819 * b_ + 4.69891013 * a_))));
    // prettier-ignore
    const Tmid = 0.11239642 + 1 / (1.61320320 - 0.68124379 * b_ + a_ * (+0.40370612 + 0.90148123 * b_ + a_ * (-0.27087943 + 0.61223990 * b_ + a_ * (+0.00299215 - 0.45399568 * b_ - 0.14661872 * a_))));
    const k = Cmax / Math.min(L * STmax[0], (1 - L) * STmax[1]);
    let Ca = L * Smid;
    let Cb = (1 - L) * Tmid;
    const Cmid = 0.9 * k * Math.sqrt(Math.sqrt(1 / (1 / (Ca * Ca * Ca * Ca) + 1 / (Cb * Cb * Cb * Cb))));
    Ca = L * 0.4;
    Cb = (1 - L) * 0.8;
    return [
        Math.sqrt(1 / (1 / (Ca * Ca) + 1 / (Cb * Cb))),
        Cmid,
        Cmax
    ];
}
/**
 * Updates a color based on Okhsl values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [α]
 * @returns {import("./color.js").color}
 */ function fromOkhsl(color, h, s, l, α) {
    if (l == 1) {
        color[0] = color[1] = color[2] = 1;
    } else if (l == 0) {
        color[0] = color[1] = color[2] = 0;
    } else {
        const a_ = Math.cos(2 * Math.PI * h);
        const b_ = Math.sin(2 * Math.PI * h);
        let L = toeInv(l);
        const [C0, Cmid, Cmax] = getCs(L, a_, b_);
        let C, t, k0, k1, k2;
        if (s < 0.8) {
            t = 1.25 * s;
            k0 = 0;
            k1 = 0.8 * C0;
            k2 = 1 - k1 / Cmid;
        } else {
            t = 5 * (s - 0.8);
            k0 = Cmid;
            k1 = 0.2 * Cmid * Cmid * 1.25 * 1.25 / C0;
            k2 = 1 - k1 / (Cmax - Cmid);
        }
        C = k0 + t * k1 / (1 - k2 * t);
        fromOklab(color, L, C * a_, C * b_);
    }
    return setAlpha(color, α);
}
/**
 * Returns an Okhsl representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {okhsl}
 */ function toOkhsl(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    linearSrgbToOklab(TMP, srgbToLinear(r), srgbToLinear(g), srgbToLinear(b));
    const C = Math.sqrt(TMP[1] * TMP[1] + TMP[2] * TMP[2]);
    const a_ = TMP[1] / C;
    const b_ = TMP[2] / C;
    const L = TMP[0];
    out[0] = 0.5 + 0.5 * Math.atan2(-TMP[2], -TMP[1]) / Math.PI;
    const [C0, Cmid, Cmax] = getCs(L, a_, b_);
    if (C < Cmid) {
        const k0 = 0;
        const k1 = 0.8 * C0;
        const k2 = 1 - k1 / Cmid;
        const t = (C - k0) / (k1 + k2 * (C - k0));
        out[1] = t * 0.8;
    } else {
        const k0 = Cmid;
        const k1 = 0.2 * Cmid * Cmid * 1.25 * 1.25 / C0;
        const k2 = 1 - k1 / (Cmax - Cmid);
        const t = (C - k0) / (k1 + k2 * (C - k0));
        out[1] = 0.8 + 0.2 * t;
    }
    out[2] = toe(L);
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} lchuv CIELChuv Luminance Chroma Hue.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://en.wikipedia.org/wiki/CIELUV}
 */ /**
 * Updates a color based on LCHuv values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} l
 * @param {number} c
 * @param {number} h
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromLCHuv(color, l, c, h, a) {
    return fromXYZ(color, ...luvToXyz(lchToLuv([
        l,
        c,
        h
    ])), a);
}
/**
 * Returns a LCHuv representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {lchuv}
 */ function toLCHuv(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    [out[0], out[1], out[2]] = luvToLch(xyzToLuv(toXYZ([
        r,
        g,
        b
    ])));
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} hsluv CIELUV hue, saturation, lightness.
 *
 * All components in the range 0 <= x <= 1
 * @see {@link https://www.hsluv.org/}
 */ const lengthOfRayUntilIntersect = (theta, param)=>{
    let { intercept , slope  } = param;
    return intercept / (Math.sin(theta) - slope * Math.cos(theta));
};
const maxChromaForLH = (L, H)=>{
    const hrad = H * Math.PI * 2;
    const bounds = getBounds(L * 100);
    let min = Infinity;
    let _g = 0;
    while(_g < bounds.length){
        const bound = bounds[_g];
        ++_g;
        const length = lengthOfRayUntilIntersect(hrad, bound);
        if (length >= 0) min = Math.min(min, length);
    }
    return min / 100;
};
const hsluvToLch = (param)=>{
    let [H, S, L] = param;
    if (L > 1 - L_EPSILON) return [
        1,
        0,
        H
    ];
    if (L < L_EPSILON) return [
        0,
        0,
        H
    ];
    return [
        L,
        maxChromaForLH(L, H) * S,
        H
    ];
};
const lchToHsluv = (param)=>{
    let [L, C, H] = param;
    if (L > 1 - L_EPSILON) return [
        H,
        0,
        1
    ];
    if (L < L_EPSILON) return [
        H,
        0,
        0
    ];
    return [
        H,
        C / maxChromaForLH(L, H),
        L
    ];
};
/**
 * Updates a color based on HSLuv values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromHSLuv(color, h, s, l, a) {
    return fromLCHuv(color, ...hsluvToLch([
        h,
        s,
        l
    ]), a);
}
/**
 * Returns a HSLuv representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {hsluv}
 */ function toHSLuv(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    [out[0], out[1], out[2]] = lchToHsluv(toLCHuv([
        r,
        g,
        b
    ]));
    return setAlpha(out, a);
}

/**
 * @typedef {number[]} hpluv CIELUV hue, saturation, lightness.
 *
 * All components in the range 0 <= x <= 1.
 */ const distanceLineFromOrigin = (param)=>{
    let { intercept , slope  } = param;
    return Math.abs(intercept) / Math.sqrt(slope ** 2 + 1);
};
const maxSafeChromaForL = (L)=>{
    const bounds = getBounds(L * 100);
    let min = Infinity;
    let _g = 0;
    while(_g < bounds.length){
        const bound = bounds[_g];
        ++_g;
        const length = distanceLineFromOrigin(bound);
        min = Math.min(min, length);
    }
    return min / 100;
};
const hpluvToLch = (param)=>{
    let [H, S, L] = param;
    if (L > 1 - L_EPSILON) return [
        1,
        0,
        H
    ];
    if (L < L_EPSILON) return [
        0,
        0,
        H
    ];
    return [
        L,
        maxSafeChromaForL(L) * S,
        H
    ];
};
const lchToHpluv = (param)=>{
    let [L, C, H] = param;
    if (L > 1 - L_EPSILON) return [
        H,
        0,
        1
    ];
    if (L < L_EPSILON) return [
        H,
        0,
        0
    ];
    return [
        H,
        C / maxSafeChromaForL(L),
        L
    ];
};
/**
 * Updates a color based on HPLuv values and alpha.
 * @param {import("./color.js").color} color
 * @param {number} h
 * @param {number} s
 * @param {number} l
 * @param {number} [a]
 * @returns {import("./color.js").color}
 */ function fromHPLuv(color, h, s, l, a) {
    return fromLCHuv(color, ...hpluvToLch([
        h,
        s,
        l
    ]), a);
}
/**
 * Returns a HPLuv representation of a given color.
 * @param {import("./color.js").color} color
 * @param {Array} out
 * @returns {hpluv}
 */ function toHPLuv(param, out) {
    let [r, g, b, a] = param;
    if (out === void 0) out = [];
    [out[0], out[1], out[2]] = lchToHpluv(toLCHuv([
        r,
        g,
        b
    ]));
    return setAlpha(out, a);
}

/**
 * Returns a rgb CSS string representation of a given color.
 * @param {import("./color.js").color} color
 * @param {number} [precision=5]
 * @returns {css}
 */ function toCSSRGB(color, precision) {
    if (precision === void 0) precision = 5;
    toBytes(color, TMP);
    if (precision !== undefined) floorArray(TMP, precision);
    const a = color[3] !== undefined ? `, ${color[3]}` : "";
    return `rgb${a ? "a" : ""}(${TMP.slice(0, 3).join(", ")}${a})`;
}
/**
 * Returns a hsl CSS string representation of a given color.
 * @param {import("./color.js").color} color
 * @param {number} [precision=5]
 * @returns {css}
 */ function toCSSHSL(color, precision) {
    if (precision === void 0) precision = 5;
    toHSL(color, TMP);
    TMP[0] *= 360;
    TMP[1] *= 100;
    TMP[2] *= 100;
    if (precision !== undefined) floorArray(TMP, precision);
    const a = color[3] !== undefined ? `, ${color[3]}` : "";
    return `hsl${a ? "a" : ""}(${TMP[0]}, ${TMP[1]}%, ${TMP[2]}%${a})`;
}
/**
 * Returns a lab CSS string representation of a given color.
 * @param {import("./color.js").color} color
 * @param {number} [precision=5]
 * @returns {css}
 */ function toCSSLab(color, precision) {
    if (precision === void 0) precision = 5;
    toLab(color, TMP, D50);
    TMP[0] *= 100;
    TMP[1] *= 100;
    TMP[2] *= 100;
    if (precision !== undefined) floorArray(TMP, precision);
    return `lab(${TMP[0]}% ${TMP[1]} ${TMP[2]}${color[3] !== undefined ? ` / ${color[3]}` : ""})`;
}
/**
 * Returns a lch CSS string representation of a given color.
 * @param {import("./color.js").color} color
 * @param {number} [precision=5]
 * @returns {css}
 */ function toCSSLCH(color, precision) {
    if (precision === void 0) precision = 5;
    toLCHuv(color, TMP);
    if (precision !== undefined) floorArray(TMP, precision);
    return `lch(${TMP[0]}% ${TMP[1]} ${TMP[2]}${color[3] !== undefined ? ` / ${color[3]}` : ""})`;
}
/**
 * Returns a hwb CSS string representation of a given color.
 * @param {import("./color.js").color} color
 * @param {number} [precision=5]
 * @returns {css}
 */ function toCSSHWB(color, precision) {
    if (precision === void 0) precision = 5;
    toHWB(color, TMP);
    if (precision !== undefined) floorArray(TMP, precision);
    return `hwb(${TMP[0]}% ${TMP[1]} ${TMP[2]}${color[3] !== undefined ? ` / ${color[3]}` : ""})`;
}

export { D50, D65, copy, create, fromBytes, fromHPLuv, fromHSL, fromHSLuv, fromHSV, fromHWB, fromLCHuv, fromLab, fromLinear, fromOkhsl, fromOkhsv, fromOklab, fromRGB, fromRGBBytes, fromValues, fromXYZ, linearSrgbToOklab, set, toBytes, toCSSHSL, toCSSHWB, toCSSLCH, toCSSLab, toCSSRGB, toHPLuv, toHSL, toHSLuv, toHSV, toHWB, toLCHuv, toLab, toLinear, toOkhsl, toOkhsv, toOklab, toRGB, toRGBBytes, toXYZ };
