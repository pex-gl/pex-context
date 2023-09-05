import { e as copy, s as sub$1, f as scale$1 } from './_chunks/vec3-81d013fb.js';
import { a as sub, e as scale } from './_chunks/avec3-d7dfe38e.js';

/**
 * Creates a new bounding box.
 * @returns {import("./types.js").aabb}
 */ function create() {
    // [min, max]
    return [
        [
            Infinity,
            Infinity,
            Infinity
        ],
        [
            -Infinity,
            -Infinity,
            -Infinity
        ]
    ];
}
/**
 * Updates a bounding box from a list of points.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3[] | import("pex-math/types/types").TypedArray} points
 * @returns {import("./types.js").aabb}
 */ function fromPoints(a, points) {
    const isTypedArray = !Array.isArray(points);
    for(let i = 0; i < points.length / (isTypedArray ? 3 : 1); i++){
        if (isTypedArray) {
            includePoint(a, points, i * 3);
        } else {
            includePoint(a, points[i]);
        }
    }
    return a;
}
/**
 * Returns the center of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} out
 * @returns {import("pex-math/types/types").vec3}
 */ function center(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
    out[0] = (a[0][0] + a[1][0]) / 2;
    out[1] = (a[0][1] + a[1][1]) / 2;
    out[2] = (a[0][2] + a[1][2]) / 2;
    return out;
}
/**
 * Returns the size of a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} out
 * @returns {import("pex-math/types/types").vec3}
 */ function size(a, out) {
    if (out === void 0) out = [
        0,
        0,
        0
    ];
    out[0] = Math.abs(a[1][0] - a[0][0]);
    out[1] = Math.abs(a[1][1] - a[0][1]);
    out[2] = Math.abs(a[1][2] - a[0][2]);
    return out;
}
/**
 * Includes a point in a bounding box.
 * @param {import("./types.js").aabb} a
 * @param {import("pex-math/types/types").vec3} p
 * @param {number} [i=0] offset in the point array
 * @returns {import("pex-math/types/types").vec3}
 */ function includePoint(a, p, i) {
    if (i === void 0) i = 0;
    a[0][0] = Math.min(a[0][0], p[i + 0]);
    a[0][1] = Math.min(a[0][1], p[i + 1]);
    a[0][2] = Math.min(a[0][2], p[i + 2]);
    a[1][0] = Math.max(a[1][0], p[i + 0]);
    a[1][1] = Math.max(a[1][1], p[i + 1]);
    a[1][2] = Math.max(a[1][2], p[i + 2]);
    return a;
}

function centerAndNormalize(positions) {
    const isTypedArray = !Array.isArray(positions);
    const stride = isTypedArray ? 3 : 1;
    const bbox = create();
    fromPoints(bbox, positions);
    const center$1 = center(bbox);
    const size$1 = size(bbox);
    const scale$2 = 1 / Math.max(...size$1);
    for(let i = 0; i < positions.length / stride; i++){
        if (isTypedArray) {
            sub(positions, i, center$1, 0);
            scale(positions, i, scale$2);
        } else {
            const p = copy(positions[i]);
            sub$1(p, center$1);
            scale$1(p, scale$2);
            positions[i] = p;
        }
    }
    return positions;
}

export { centerAndNormalize as default };
