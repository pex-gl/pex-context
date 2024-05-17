import { s as set, a as sub$1, f as scale$1, b as add$1, d as create$1 } from './_chunks/vec3-CYW9rG16.js';
import { a as sub, e as scale, b as add } from './_chunks/avec3-BSBrm7T8.js';

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
    const isFlatArray = !points[0]?.length;
    const l = points.length / (isFlatArray ? 3 : 1);
    for(let i = 0; i < l; i++){
        if (isFlatArray) {
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

const TEMP_VEC3 = create$1();
function centerAndNormalize(positions, param) {
    let { center: center$1 =true , normalize =true , normalizedSize =1  } = param === void 0 ? {} : param;
    const isFlatArray = !positions[0]?.length;
    const positionsCount = positions.length / (isFlatArray ? 3 : 1);
    const bbox = fromPoints(create(), positions);
    const bboxCenter = center(bbox);
    if (normalize) {
        const size$1 = size(bbox);
        normalizedSize = normalizedSize / (Math.max(...size$1) || 1);
    }
    for(let i = 0; i < positionsCount; i++){
        if (isFlatArray) {
            sub(positions, i, bboxCenter, 0);
            if (normalize) {
                scale(positions, i, normalizedSize);
                if (!center$1) add(positions, i, bboxCenter, 0);
            }
        } else {
            set(TEMP_VEC3, positions[i]);
            sub$1(TEMP_VEC3, bboxCenter);
            if (normalize) {
                scale$1(TEMP_VEC3, normalizedSize);
                if (!center$1) add$1(TEMP_VEC3, bboxCenter);
            }
            set(positions[i], TEMP_VEC3);
        }
    }
    return positions;
}

export { centerAndNormalize as default };
