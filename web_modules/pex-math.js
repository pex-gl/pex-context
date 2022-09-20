import { t as cross$1, d as set$6, e as dot$2 } from './common/vec3-16c449b6.js';
export { u as mat4, v as vec2, w as vec3 } from './common/vec3-16c449b6.js';
import { E as EPSILON, c as clamp } from './common/utils-22518481.js';
export { u as utils } from './common/utils-22518481.js';
import './common/web.dom-collections.iterator-7ea8a356.js';

/** @module mat2x3 */

/**
 * Returns a 2x3 identity matrix, a short form for a 3x3 matrix with the last row ignored.
 *
 * Row major memory layout:
 *
 * ```
 * 0   1
 * 2   3
 * 4   5
 * ```
 *
 * Equivalent to the column major OpenGL spec:
 *
 * ```
 * 0   3
 * 1   4
 * 2   5
 *
 * m00 m10
 * m01 m11
 * m02 m12
 * ```
 * @returns {import("./types.js").mat2x3}
 */
function create() {
  // prettier-ignore
  return [1, 0, 0, 1, 0, 0];
}
/**
 * Sets a matrix to the identity matrix.
 * @param {import("./types.js").mat2x3} a
 * @returns {import("./types.js").mat2x3}
 */

function identity(a) {
  a[0] = a[3] = 1;
  a[1] = a[2] = a[4] = a[5] = 0;
  return a;
}
/**
 * Returns a copy of a matrix.
 * @param {import("./types.js").mat2x3} a
 * @returns {import("./types.js").mat2x3}
 */

function copy(a) {
  return a.slice();
}
/**
 * Sets a matrix from another matrix.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").mat2x3} b
 * @returns {import("./types.js").mat2x3}
 */

function set(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  a[3] = b[3];
  a[4] = b[4];
  a[5] = b[5];
  return a;
}
/**
 * Compares two matrices.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").mat2x3} b
 * @returns {boolean}
 */

function equals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
}
/**
 * Multiplies two matrices.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").mat2x3} b
 * @returns {import("./types.js").mat2x3}
 */

function mult(a, b) {
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const a3 = a[3];
  const a4 = a[4];
  const a5 = a[5];
  const b0 = b[0];
  const b1 = b[1];
  const b2 = b[2];
  const b3 = b[3];
  const b4 = b[4];
  const b5 = b[5];
  a[0] = a0 * b0 + a2 * b1;
  a[1] = a1 * b0 + a3 * b1;
  a[2] = a0 * b2 + a2 * b3;
  a[3] = a1 * b2 + a3 * b3;
  a[4] = a0 * b4 + a2 * b5 + a4;
  a[5] = a1 * b4 + a3 * b5 + a5;
  return a;
}
/**
 * Translates a matrix by a vector.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").vec2} v
 * @returns {import("./types.js").mat2x3}
 */

function translate(a, v) {
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const a3 = a[3];
  const a4 = a[4];
  const a5 = a[5];
  const x = v[0];
  const y = v[1];
  a[0] = a0;
  a[1] = a1;
  a[2] = a2;
  a[3] = a3;
  a[4] = a0 * x + a2 * y + a4;
  a[5] = a1 * x + a3 * y + a5;
  return a;
}
/**
 * Rotates a matrix by an angle.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").Radians} rad
 * @returns {import("./types.js").mat2x3}
 */

function rotate(a, rad) {
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const a3 = a[3];
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  a[0] = a0 * c + a2 * s;
  a[1] = a1 * c + a3 * s;
  a[2] = a0 * -s + a2 * c;
  a[3] = a1 * -s + a3 * c;
  return a;
}
/**
 * Scales a matrix by a vector.
 * @param {import("./types.js").mat2x3} a
 * @param {import("./types.js").vec2} v
 * @returns {import("./types.js").mat2x3}
 */

function scale(a, v) {
  const a0 = a[0];
  const a1 = a[1];
  const a2 = a[2];
  const a3 = a[3];
  a[0] = a0 * v[0];
  a[1] = a1 * v[0];
  a[2] = a2 * v[1];
  a[3] = a3 * v[1];
  return a;
}

var mat2x3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  identity: identity,
  copy: copy,
  set: set,
  equals: equals,
  mult: mult,
  translate: translate,
  rotate: rotate,
  scale: scale
});

/** @module mat3 */

/**
 * Returns a 3x3 identity matrix.
 *
 * Row major memory layout:
 *
 * ```
 *  0   1   2
 *  3   4   5
 *  6   7   8
 * ```
 *
 *  Equivalent to the column major OpenGL spec:
 *
 * ```
 *   0   3   6
 *   1   4   7
 *   2   5   8
 *
 *  m00 m10 m20
 *  m01 m11 m21
 *  m02 m12 m22
 * ```
 * @returns {import("./types.js").mat3}
 */
function create$1() {
  // prettier-ignore
  return [1, 0, 0, 0, 1, 0, 0, 0, 1];
}
/**
 * Sets a matrix to the identity matrix.
 * @param {import("./types.js").mat3} a
 * @returns {import("./types.js").mat3}
 */

function identity$1(a) {
  a[0] = a[4] = a[8] = 1;
  a[1] = a[2] = a[3] = a[5] = a[6] = a[7] = 0;
  return a;
}
/**
 * Returns a copy of a matrix.
 * @param {import("./types.js").mat3} a
 * @returns {import("./types.js").mat3}
 */

function copy$1(a) {
  return a.slice();
}
/**
 * Sets a matrix from another matrix.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").mat3} b
 * @returns {import("./types.js").mat3}
 */

function set$1(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  a[3] = b[3];
  a[4] = b[4];
  a[5] = b[5];
  a[6] = b[6];
  a[7] = b[7];
  a[8] = b[8];
  return a;
}
/**
 * Compares two matrices.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").mat3} b
 * @returns {boolean}
 */

function equals$1(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9];
}
/**
 * Multiplies two matrices.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").mat3} b
 * @returns {import("./types.js").mat3}
 */

function mult$1(a, b) {
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a10 = a[3];
  const a11 = a[4];
  const a12 = a[5];
  const a20 = a[6];
  const a21 = a[7];
  const a22 = a[8];
  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b10 = b[3];
  const b11 = b[4];
  const b12 = b[5];
  const b20 = b[6];
  const b21 = b[7];
  const b22 = b[8];
  a[0] = b00 * a00 + b01 * a10 + b02 * a20;
  a[1] = b00 * a01 + b01 * a11 + b02 * a21;
  a[2] = b00 * a02 + b01 * a12 + b02 * a22;
  a[3] = b10 * a00 + b11 * a10 + b12 * a20;
  a[4] = b10 * a01 + b11 * a11 + b12 * a21;
  a[5] = b10 * a02 + b11 * a12 + b12 * a22;
  a[6] = b20 * a00 + b21 * a10 + b22 * a20;
  a[7] = b20 * a01 + b21 * a11 + b22 * a21;
  a[8] = b20 * a02 + b21 * a12 + b22 * a22;
  return a;
}
/**
 * Transposes a matrix.
 * @param {import("./types.js").mat3} a
 * @returns {import("./types.js").mat3}
 */

function transpose(a) {
  const a01 = a[1];
  const a02 = a[2];
  const a12 = a[5];
  a[1] = a[3];
  a[2] = a[6];
  a[3] = a01;
  a[5] = a[7];
  a[6] = a02;
  a[7] = a12;
  return a;
}
/**
 * Sets matrix to a quaternion.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").quat} q
 * @returns {import("./types.js").mat3}
 */

function fromQuat(a, q) {
  const x = q[0];
  const y = q[1];
  const z = q[2];
  const w = q[3];
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  a[0] = 1 - (yy + zz);
  a[3] = xy - wz;
  a[6] = xz + wy;
  a[1] = xy + wz;
  a[4] = 1 - (xx + zz);
  a[7] = yz - wx;
  a[2] = xz - wy;
  a[5] = yz + wx;
  a[8] = 1 - (xx + yy);
  return a;
}
/**
 * Sets a 3x3 matrix from a 2x3 matrix.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").mat2x3} b
 * @returns {import("./types.js").mat3}
 */

function fromMat2x3(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = 0;
  a[3] = b[2];
  a[4] = b[3];
  a[5] = 0;
  a[6] = b[4];
  a[7] = b[5];
  a[8] = 1;
  return a;
}
/**
 * Sets a 3x3 matrix to a 4x4 matrix.
 * @param {import("./types.js").mat3} a
 * @param {import("./types.js").mat4} b
 * @returns {import("./types.js").mat3}
 */

function fromMat4(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  a[3] = b[4];
  a[4] = b[5];
  a[5] = b[6];
  a[6] = b[8];
  a[7] = b[9];
  a[8] = b[10];
  return a;
}

var mat3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$1,
  identity: identity$1,
  copy: copy$1,
  set: set$1,
  equals: equals$1,
  mult: mult$1,
  transpose: transpose,
  fromQuat: fromQuat,
  fromMat2x3: fromMat2x3,
  fromMat4: fromMat4
});

/** @module vec4 */

/**
 * Returns a new vec4 at 0, 0, 0, 1.
 * @returns {import("./types.js").vec4}
 */
function create$2() {
  return [0, 0, 0, 1];
}
/**
 * Returns a copy of a vector.
 * @param {import("./types.js").vec4} a
 * @returns {import("./types.js").vec4}
 */

function copy$2(a) {
  return a.slice();
}
/**
 * Sets a vector to another vector.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @returns {import("./types.js").vec4}
 */

function set$2(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  a[3] = b[3];
  return a;
}
/**
 * Compares two vectors.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @returns {boolean}
 */

function equals$2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
/**
 * Adds a vector to another.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @returns {import("./types.js").vec4}
 */

function add(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  a[3] += b[3];
  return a;
}
/**
 * Subtracts a vector from another.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @returns {import("./types.js").vec4}
 */

function sub(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
  a[2] -= b[2];
  a[3] -= b[3];
  return a;
}
/**
 * Scales a vector by a number.
 * @param {import("./types.js").vec4} a
 * @param {number} s
 * @returns {import("./types.js").vec4}
 */

function scale$1(a, s) {
  a[0] *= s;
  a[1] *= s;
  a[2] *= s;
  a[3] *= s;
  return a;
}
/**
 * Adds two vectors after scaling the second one.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @param {number} s
 * @returns {import("./types.js").vec4}
 */

function addScaled(a, b, s) {
  a[0] += b[0] * s;
  a[1] += b[1] * s;
  a[2] += b[2] * s;
  a[3] += b[3] * s;
  return a;
}
/**
 * Create a vec4 from vec3.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec3} b
 * @returns {import("./types.js").vec4}
 */

function fromVec3(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  a[3] = 1;
  return a;
}
/**
 * Multiplies a vector with a matrix.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").mat4} m
 * @returns {import("./types.js").vec4}
 */

function multMat4(a, m) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  a[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
  a[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
  a[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
  a[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
  return a;
}
/**
 * Linearly interpolates between two vectors.
 * @param {import("./types.js").vec4} a
 * @param {import("./types.js").vec4} b
 * @param {number} t
 * @returns {import("./types.js").vec4}
 */

function lerp(a, b, t) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  a[0] = x + (b[0] - x) * t;
  a[1] = y + (b[1] - y) * t;
  a[2] = z + (b[2] - z) * t;
  a[3] = w + (b[3] - w) * t;
  return a;
}
/**
 * Prints a vector to a string.
 * @param {import("./types.js").vec4} a
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString(a, precision = 4) {
  const scale = 10 ** precision; // prettier-ignore

  return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}, ${Math.floor(a[2] * scale) / scale}, ${Math.floor(a[3] * scale) / scale}]`;
}

var vec4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$2,
  copy: copy$2,
  set: set$2,
  equals: equals$2,
  add: add,
  sub: sub,
  scale: scale$1,
  addScaled: addScaled,
  fromVec3: fromVec3,
  multMat4: multMat4,
  lerp: lerp,
  toString: toString
});

/** @module avec3 */

/**
 * Sets a vector components.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {number} x
 * @param {number} y
 * @param {number} z
 */
function set3(a, i, x, y, z) {
  a[i * 3 + 0] = x;
  a[i * 3 + 1] = y;
  a[i * 3 + 2] = z;
}
/**
 * Sets a vector to another vector.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 */

function set$3(a, i, b, j) {
  a[i * 3] = b[j * 3];
  a[i * 3 + 1] = b[j * 3 + 1];
  a[i * 3 + 2] = b[j * 3 + 2];
}
/**
 * Compares two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 * @returns {boolean}
 */

function equals$3(a, i, b, j) {
  return a[i * 3] === b[j * 3] && a[i * 3 + 1] === b[j * 3 + 1] && a[i * 3 + 2] === b[j * 3 + 2];
}
/**
 * Adds a vector to another.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 */

function add$1(a, i, b, j) {
  a[i * 3] += b[j * 3];
  a[i * 3 + 1] += b[j * 3 + 1];
  a[i * 3 + 2] += b[j * 3 + 2];
}
/**
 * Subtracts a vector from another.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 */

function sub$1(a, i, b, j) {
  a[i * 3] -= b[j * 3];
  a[i * 3 + 1] -= b[j * 3 + 1];
  a[i * 3 + 2] -= b[j * 3 + 2];
}
/**
 * Scales a vector by a number.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {number} s
 */

function scale$2(a, i, s) {
  a[i * 3] *= s;
  a[i * 3 + 1] *= s;
  a[i * 3 + 2] *= s;
}
/**
 * Adds two vectors after scaling the second one.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 * @param {number} s
 */

function addScaled$1(a, i, b, j, s) {
  a[i * 3] += b[j * 3] * s;
  a[i * 3 + 1] += b[j * 3 + 1] * s;
  a[i * 3 + 2] += b[j * 3 + 2] * s;
}
/**
 * Calculates the dot product of two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 */

function dot(a, i, b, j) {
  return a[i * 3] * b[j * 3] + a[i * 3 + 1] * b[j * 3 + 1] + a[i * 3 + 2] * b[j * 3 + 2];
}
/**
 * Calculates the cross product of two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 */

function cross(a, i, b, j) {
  const x = a[i * 3];
  const y = a[i * 3 + 1];
  const z = a[i * 3 + 2];
  const vx = b[j * 3];
  const vy = b[j * 3 + 1];
  const vz = b[j * 3 + 2];
  a[i * 3] = y * vz - vy * z;
  a[i * 3 + 1] = z * vx - vz * x;
  a[i * 3 + 2] = x * vy - vx * y;
}
/**
 * Calculates the length of a vector.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @returns {number}
 */

function length(a, i) {
  const x = a[i * 3];
  const y = a[i * 3 + 1];
  const z = a[i * 3 + 2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Calculates the squared length of a vector.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @returns {number}
 */

function lengthSq(a, i) {
  const x = a[i * 3];
  const y = a[i * 3 + 1];
  const z = a[i * 3 + 2];
  return x * x + y * y + z * z;
}
/**
 * Normalises a vector.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 */

function normalize(a, i) {
  const lenSq = a[i * 3] * a[i * 3] + a[i * 3 + 1] * a[i * 3 + 1] + a[i * 3 + 2] * a[i * 3 + 2];

  if (lenSq > 0) {
    const len = Math.sqrt(lenSq);
    a[i * 3] /= len;
    a[i * 3 + 1] /= len;
    a[i * 3 + 2] /= len;
  }
}
/**
 * Calculates the distance between two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 * @returns {number}
 */

function distance(a, i, b, j) {
  const dx = b[j * 3] - a[i * 3];
  const dy = b[j * 3 + 1] - a[i * 3 + 1];
  const dz = b[j * 3 + 2] - a[i * 3 + 2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/**
 * Calculates the squared distance between two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 * @returns {number}
 */

function distanceSq(a, i, b, j) {
  const dx = b[j * 3] - a[i * 3];
  const dy = b[j * 3 + 1] - a[i * 3 + 1];
  const dz = b[j * 3 + 2] - a[i * 3 + 2];
  return dx * dx + dy * dy + dz * dz;
}
/**
 * Limits a vector to a length.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {number} len
 */

function limit(a, i, len) {
  const x = a[i * 3];
  const y = a[i * 3 + 1];
  const z = a[i * 3 + 2];
  const dsq = x * x + y * y + z * z;
  const lsq = len * len;

  if (lsq > 0 && dsq > lsq) {
    const nd = len / Math.sqrt(dsq);
    a[i * 3] *= nd;
    a[i * 3 + 1] *= nd;
    a[i * 3 + 2] *= nd;
  }
}
/**
 * Linearly interpolates between two vectors.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {import("./types.js").avec3} b
 * @param {number} j
 * @param {number} t
 */

function lerp$1(a, i, b, j, t) {
  const x = a[i * 3];
  const y = a[i * 3 + 1];
  const z = a[i * 3 + 2];
  a[i * 3] = x + (b[j * 3] - x) * t;
  a[i * 3 + 1] = y + (b[j * 3 + 1] - y) * t;
  a[i * 3 + 2] = z + (b[j * 3 + 2] - z) * t;
}
/**
 * Prints a vector to a string.
 * @param {import("./types.js").avec3} a
 * @param {number} i
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString$1(a, i, precision = 4) {
  const scale = 10 ** precision; // prettier-ignore

  return `[${Math.floor(a[i * 3] * scale) / scale}, ${Math.floor(a[i * 3 + 1] * scale) / scale}, ${Math.floor(a[i * 3 + 2] * scale) / scale}]`;
}

var avec3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  set3: set3,
  set: set$3,
  equals: equals$3,
  add: add$1,
  sub: sub$1,
  scale: scale$2,
  addScaled: addScaled$1,
  dot: dot,
  cross: cross,
  length: length,
  lengthSq: lengthSq,
  normalize: normalize,
  distance: distance,
  distanceSq: distanceSq,
  limit: limit,
  lerp: lerp$1,
  toString: toString$1
});

/** @module avec4 */

/**
 * Sets a vector components.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} w
 */
function set4(a, i, x, y, z, w) {
  a[i * 4 + 0] = x;
  a[i * 4 + 1] = y;
  a[i * 4 + 2] = z;
  a[i * 4 + 3] = w;
}
/**
 * Sets a vector to another vector.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 */

function set$4(a, i, b, j) {
  a[i * 4] = b[j * 4];
  a[i * 4 + 1] = b[j * 4 + 1];
  a[i * 4 + 2] = b[j * 4 + 2];
  a[i * 4 + 3] = b[j * 4 + 3];
}
/**
 * Compares two vectors.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 * @returns {boolean}
 */

function equals$4(a, i, b, j) {
  return a[i * 4] === b[j * 4] && a[i * 4 + 1] === b[j * 4 + 1] && a[i * 4 + 2] === b[j * 4 + 2] && a[i * 4 + 3] === b[j * 4 + 3];
}
/**
 * Adds a vector to another.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 */

function add$2(a, i, b, j) {
  a[i * 4] += b[j * 4];
  a[i * 4 + 1] += b[j * 4 + 1];
  a[i * 4 + 2] += b[j * 4 + 2];
  a[i * 4 + 3] += b[j * 4 + 3];
}
/**
 * Subtracts a vector from another.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 */

function sub$2(a, i, b, j) {
  a[i * 4] -= b[j * 4];
  a[i * 4 + 1] -= b[j * 4 + 1];
  a[i * 4 + 2] -= b[j * 4 + 2];
  a[i * 4 + 3] -= b[j * 4 + 3];
}
/**
 * Scales a vector by a number.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {number} s
 */

function scale$3(a, i, s) {
  a[i * 4] *= s;
  a[i * 4 + 1] *= s;
  a[i * 4 + 2] *= s;
  a[i * 4 + 3] *= s;
}
/**
 * Adds two vectors after scaling the second one.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 * @param {number} s
 */

function addScaled$2(a, i, b, j, s) {
  a[i * 4] += b[j * 4] * s;
  a[i * 4 + 1] += b[j * 4 + 1] * s;
  a[i * 4 + 2] += b[j * 4 + 2] * s;
  a[i * 4 + 3] += b[j * 4 + 3] * s;
}
/**
 * Linearly interpolates between two vectors.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {import("./types.js").avec4} b
 * @param {number} j
 * @param {number} t
 */

function lerp$2(a, i, b, j, t) {
  const x = a[i * 4];
  const y = a[i * 4 + 1];
  const z = a[i * 4 + 2];
  const w = a[i * 4 + 3];
  a[i * 4] = x + (b[j * 4] - x) * t;
  a[i * 4 + 1] = y + (b[j * 4 + 1] - y) * t;
  a[i * 4 + 2] = z + (b[j * 4 + 2] - z) * t;
  a[i * 4 + 3] = w + (b[j * 4 + 3] - w) * t;
}
/**
 * Prints a vector to a string.
 * @param {import("./types.js").avec4} a
 * @param {number} i
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString$2(a, i, precision = 4) {
  const scale = 10 ** precision; // prettier-ignore

  return `[${Math.floor(a[i * 4] * scale) / scale}, ${Math.floor(a[i * 4 + 1] * scale) / scale}, ${Math.floor(a[i * 4 + 2] * scale) / scale}, ${Math.floor(a[i * 4 + 3] * scale) / scale}]`;
}

var avec4 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  set4: set4,
  set: set$4,
  equals: equals$4,
  add: add$2,
  sub: sub$2,
  scale: scale$3,
  addScaled: addScaled$2,
  lerp: lerp$2,
  toString: toString$2
});

/** @module quat */
/**
 * Returns a new quat at 0, 0, 0, 1.
 * @returns {import("./types.js").quat}
 */

function create$3() {
  return [0, 0, 0, 1];
}
/**
 * Sets a quaternion to the identity quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function identity$2(a) {
  a[0] = a[1] = a[2] = 0;
  a[3] = 1;
  return a;
}
/**
 * Returns a copy of a quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function copy$3(a) {
  return a.slice();
}
/**
 * Sets a quaternion to another quaternion.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").quat} b
 * @returns {import("./types.js").quat}
 */

const set$5 = set$2;
/**
 * Compares two quaternions.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").quat} b
 * @returns {boolean}
 */

const equals$5 = equals$2;
/**
 * Multiplies one quaternion by another.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").quat} b
 * @returns {import("./types.js").quat}
 */

function mult$2(a, b) {
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  a[0] = aw * bx + ax * bw + ay * bz - az * by;
  a[1] = aw * by + ay * bw + az * bx - ax * bz;
  a[2] = aw * bz + az * bw + ax * by - ay * bx;
  a[3] = aw * bw - ax * bx - ay * by - az * bz;
  return a;
}
/**
 * Inverts a quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function invert(a) {
  let l = dot$1(a, a);
  l = l ? 1 / l : 0;
  a[0] *= -l;
  a[1] *= -l;
  a[2] *= -l;
  a[3] *= l;
  return a;
}
/**
 * Conjugates a quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function conjugate(a) {
  a[0] *= -1;
  a[1] *= -1;
  a[2] *= -1;
  return a;
}
/**
 * Calculates the length of a quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function length$1(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
}
/**
 * Normalizes a quaternion.
 * @param {import("./types.js").quat} a
 * @returns {import("./types.js").quat}
 */

function normalize$1(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const w = a[3];
  const l = 1 / (Math.sqrt(x * x + y * y + z * z + w * w) || 1);
  a[0] *= l;
  a[1] *= l;
  a[2] *= l;
  a[3] *= l;
  return a;
}
/**
 * Calculates the dot product of two quaternions.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").quat} b
 * @returns {import("./types.js").quat}
 */

function dot$1(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
/**
 * Set euler angles to a quaternion. Assumes XYZ rotation order.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").euler} e
 * @returns {import("./types.js").quat}
 */

function fromEuler(a, e) {
  const x = e[0];
  const y = e[1];
  const z = e[2];
  const cx = Math.cos(x / 2);
  const cy = Math.cos(y / 2);
  const cz = Math.cos(z / 2);
  const sx = Math.sin(x / 2);
  const sy = Math.sin(y / 2);
  const sz = Math.sin(z / 2);
  a[0] = sx * cy * cz + cx * sy * sz;
  a[1] = cx * sy * cz - sx * cy * sz;
  a[2] = cx * cy * sz + sx * sy * cz;
  a[3] = cx * cy * cz - sx * sy * sz;
  return a;
}
/**
 * Set the angle at an axis of a quaternion.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").vec3} v
 * @param {import("./types.js").Radians} r
 * @returns {import("./types.js").quat}
 */

function fromAxisAngle(a, v, r) {
  const angle2 = r / 2;
  const sin2 = Math.sin(angle2);
  a[0] = v[0] * sin2;
  a[1] = v[1] * sin2;
  a[2] = v[2] * sin2;
  a[3] = Math.cos(angle2);
  return normalize$1(a);
}
/**
 * @private
 */

function _fromMat39(a, m0, m1, m2, m3, m4, m5, m6, m7, m8) {
  const trace = m0 + m4 + m8;
  let s;

  if (trace >= 0) {
    s = Math.sqrt(trace + 1);
    a[3] = s / 2;
    s = 0.5 / s;
    a[0] = (m5 - m7) * s;
    a[1] = (m6 - m2) * s;
    a[2] = (m1 - m3) * s;
  } else if (m0 > m4 && m0 > m8) {
    s = Math.sqrt(1 + m0 - m4 - m8);
    a[0] = s / 2;
    s = 0.5 / s;
    a[1] = (m1 + m3) * s;
    a[2] = (m6 + m2) * s;
    a[3] = (m5 - m7) * s;
  } else if (m4 > m8) {
    s = Math.sqrt(1 + m4 - m0 - m8);
    a[1] = s / 2;
    s = 0.5 / s;
    a[0] = (m1 + m3) * s;
    a[2] = (m5 + m7) * s;
    a[3] = (m6 - m2) * s;
  } else {
    s = Math.sqrt(1 + m8 - m0 - m4);
    a[2] = s / 2;
    s = 0.5 / s;
    a[0] = (m6 + m2) * s;
    a[1] = (m5 + m7) * s;
    a[3] = (m1 - m3) * s;
  }

  return a;
}
/**
 * Sets a quaternion from orthonormal base xyz.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").vec3} x
 * @param {import("./types.js").vec3} y
 * @param {import("./types.js").vec3} z
 * @returns {import("./types.js").quat}
 */

function fromAxes(a, x, y, z) {
  return _fromMat39(a, x[0], x[1], x[2], y[0], y[1], y[2], z[0], z[1], z[2]);
}
/**
 * Sets a quaternion to a 3x3 matrix.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").mat3} m
 * @returns {import("./types.js").quat}
 */

function fromMat3(a, m) {
  return _fromMat39(a, m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8]);
}
/**
 * Sets a quaternion to a 4x4 matrix.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").mat4} m
 * @returns {import("./types.js").quat}
 */

function fromMat4$1(a, m) {
  return _fromMat39(a, m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]);
}
/**
 * Sets a quaternion to represent the shortest rotation from one vector to another.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").vec3} v
 * @param {import("./types.js").vec3} w
 * @returns {import("./types.js").quat}
 */

const fromTo = (() => {
  let u = [];
  return (a, v, w) => {
    u = cross$1(set$6(u, v), w);
    a[0] = u[0];
    a[1] = u[1];
    a[2] = u[2];
    a[3] = 1 + dot$2(v, w);
    normalize$1(a);
    return a;
  };
})();
/**
 * Spherical linear interpolates between two quaternions.
 * @param {import("./types.js").quat} a
 * @param {import("./types.js").quat} b
 * @param {number} t
 * @returns {import("./types.js").quat}
 */

function slerp(a, b, t) {
  // http://jsperf.com/quaternion-slerp-implementations
  const ax = a[0];
  const ay = a[1];
  const az = a[2];
  const aw = a[3];
  const bx = b[0];
  const by = b[1];
  const bz = b[2];
  const bw = b[3];
  let omega;
  let cosom;
  let sinom;
  let scale0;
  let scale1;
  cosom = dot$1(a, b);

  if (cosom < 0) {
    cosom = -cosom;
    a[0] = -bx;
    a[1] = -by;
    a[2] = -bz;
    a[3] = -bw;
  } else {
    a[0] = bx;
    a[1] = by;
    a[2] = bz;
    a[3] = bw;
  }

  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }

  a[0] = scale0 * ax + scale1 * a[0];
  a[1] = scale0 * ay + scale1 * a[1];
  a[2] = scale0 * az + scale1 * a[2];
  a[3] = scale0 * aw + scale1 * a[3];
  return a;
}
/**
 * Prints a quaternion to a string.
 * @param {import("./types.js").quat} a
 * @param {number} precision
 * @returns {import("./types.js").quat}
 */

const toString$3 = toString;

var quat = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$3,
  identity: identity$2,
  copy: copy$3,
  set: set$5,
  equals: equals$5,
  mult: mult$2,
  invert: invert,
  conjugate: conjugate,
  length: length$1,
  normalize: normalize$1,
  dot: dot$1,
  fromEuler: fromEuler,
  fromAxisAngle: fromAxisAngle,
  _fromMat39: _fromMat39,
  fromAxes: fromAxes,
  fromMat3: fromMat3,
  fromMat4: fromMat4$1,
  fromTo: fromTo,
  slerp: slerp,
  toString: toString$3
});

/** @module euler */
/**
 * Create a new euler angles [0, 0, 0]: vec3 array of [x, y, z] rotation [yaw, pitch, roll] in radians.
 * @returns {import("./types.js").euler}
 */

function create$4() {
  return [0, 0, 0];
}
/**
 * Creates euler angles from quaternion. Assumes XYZ order of rotations.
 * @param {import("./types.js").euler} a
 * @param {import("./types.js").quat} q
 * @returns {import("./types.js").euler}
 */

function fromQuat$1(a, q) {
  const sqx = q[0] * q[0];
  const sqy = q[1] * q[1];
  const sqz = q[2] * q[2];
  const sqw = q[3] * q[3];
  a[0] = Math.atan2(2 * (q[0] * q[3] - q[1] * q[2]), sqw - sqx - sqy + sqz);
  a[1] = Math.asin(clamp(2 * (q[0] * q[2] + q[1] * q[3]), -1, 1));
  a[2] = Math.atan2(2 * (q[2] * q[3] - q[0] * q[1]), sqw + sqx - sqy - sqz);
  return a;
}

var euler = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create$4,
  fromQuat: fromQuat$1
});

export { avec3, avec4, euler, mat2x3, mat3, quat, vec4 };
