/**
 * @module utils
 */

/**
 * @typedef {number} Degrees
 */

/**
 * @typedef {number} Radians
 */

/**
 * @constant {number}
 */
const EPSILON = 0.000001;
/**
 * Linear interpolation between two numbers.
 * @param {number} a
 * @param {number} b
 * @param {number} n
 * @returns {number}
 */

function lerp(a, b, n) {
  return a + (b - a) * n;
}
/**
 * Clamps a number between two numbers.
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}
/**
 * Smooth Hermite interpolation between 0 and 1
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */

function smoothstep(n, min, max) {
  n = clamp((n - min) / (max - min), 0, 1);
  return n * n * (3 - 2 * n);
}
/**
 * Maps a number from one range to another.
 * @param {number} n
 * @param {number} inStart
 * @param {number} inEnd
 * @param {number} outStart
 * @param {number} outEnd
 * @returns {number}
 */

function map(n, inStart, inEnd, outStart, outEnd) {
  return outStart + (outEnd - outStart) * (n - inStart) / (inEnd - inStart);
}
/**
 * Transforms degrees into radians.
 * @param {Degrees} degrees
 * @returns {Radians}
 */

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}
/**
 * Transforms radians into degrees.
 * @param {Radians} radians
 * @returns {Degrees}
 */

function toDegrees(radians) {
  return radians * 180 / Math.PI;
}
/**
 * Returns the sign of a number.
 * @param {number} n
 * @returns {number}
 */

function sign(n) {
  return n / Math.abs(n);
}
/**
 * Check if a number is a power of two
 * @param {number} a
 * @returns {boolean}
 */

function isPowerOfTwo(a) {
  return (a & a - 1) === 0;
}
/**
 * Returns the next highest power of two.
 * @param {number} n
 * @returns {number}
 */

function nextPowerOfTwo(n) {
  if (n === 0) return 1;
  n--;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n + 1;
}
/**
 * Returns a shallow copy of an array.
 * @param {number[]} a
 * @returns {number[]}
 */

function shallowCopy(a) {
  return a.slice();
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  EPSILON: EPSILON,
  lerp: lerp,
  clamp: clamp,
  smoothstep: smoothstep,
  map: map,
  toRadians: toRadians,
  toDegrees: toDegrees,
  sign: sign,
  isPowerOfTwo: isPowerOfTwo,
  nextPowerOfTwo: nextPowerOfTwo,
  shallowCopy: shallowCopy
});

/**
 * @module vec3
 */
/**
 * Returns a new vec3 at 0, 0, 0.
 * @returns {vec3}
 */

function create() {
  return [0, 0, 0];
}
/**
 * Returns a copy of a vector.
 * @param {vec3} a
 * @returns {vec3}
 */

const copy = shallowCopy;
/**
 * Sets a vector to another vector.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function set(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  return a;
}
/**
 * Compares two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {boolean}
 */

function equals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
/**
 * Adds a vector to another.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function add(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  return a;
}
/**
 * Subtracts a vector from another.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function sub(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
  a[2] -= b[2];
  return a;
}
/**
 * Scales a vector by a number.
 * @param {vec3} a
 * @param {number} n
 * @returns {vec3}
 */

function scale(a, n) {
  a[0] *= n;
  a[1] *= n;
  a[2] *= n;
  return a;
}
/**
 * Adds two vectors after scaling the second one.
 * @param {vec3} a
 * @param {vec3} b
 * @param {number} n
 * @returns {vec3}
 */

function addScaled(a, b, n) {
  a[0] += b[0] * n;
  a[1] += b[1] * n;
  a[2] += b[2] * n;
  return a;
}
/**
 * Multiplies a vector by a matrix.
 * @param {vec3} a
 * @param {mat4} m
 * @returns {vec3}
 */

function multMat4(a, m) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  a[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
  a[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
  a[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  return a;
}
/**
 * Multiplies a vector by a quaternion.
 * @param {vec3} a
 * @param {quat} q
 * @returns {vec3}
 */

function multQuat(a, q) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const qx = q[0];
  const qy = q[1];
  const qz = q[2];
  const qw = q[3];
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  a[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  a[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  a[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return a;
}
/**
 * Calculates the dot product of two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {number}
 */

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/**
 * Calculates the cross product of two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {vec3}
 */

function cross(a, b) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const vx = b[0];
  const vy = b[1];
  const vz = b[2];
  a[0] = y * vz - vy * z;
  a[1] = z * vx - vz * x;
  a[2] = x * vy - vx * y;
  return a;
}
/**
 * Calculates the length of a vector.
 * @param {vec3} a
 * @returns {number}
 */

function length(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}
/**
 * Calculates the squared length of a vector.
 * @param {vec3} a
 * @returns {number}
 */

function lengthSq(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  return x * x + y * y + z * z;
}
/**
 * Normalises a vector.
 * @param {vec3} a
 * @returns {vec3}
 */

function normalize(a) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  let l = Math.sqrt(x * x + y * y + z * z);
  l = 1 / (l || 1);
  a[0] *= l;
  a[1] *= l;
  a[2] *= l;
  return a;
}
/**
 * Calculates the distance between two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {number}
 */

function distance(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/**
 * Calculates the squared distance between two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @returns {number}
 */

function distanceSq(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz;
}
/**
 * Limits a vector to a length.
 * @param {vec3} a
 * @param {vec3} n
 * @returns {vec3}
 */

function limit(a, n) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  const dsq = x * x + y * y + z * z;
  const lsq = n * n;

  if (lsq > 0 && dsq > lsq) {
    const nd = n / Math.sqrt(dsq);
    a[0] *= nd;
    a[1] *= nd;
    a[2] *= nd;
  }

  return a;
}
/**
 * Linearly interpolates between two vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @param {number} n
 * @returns {vec3}
 */

function lerp$1(a, b, n) {
  const x = a[0];
  const y = a[1];
  const z = a[2];
  a[0] = x + (b[0] - x) * n;
  a[1] = y + (b[1] - y) * n;
  a[2] = z + (b[2] - z) * n;
  return a;
}
/**
 * Prints a vector to a string.
 * @param {vec3} a
 * @param {number} [precision=4]
 * @returns {string}
 */

function toString(a, precision = 4) {
  const scale = 10 ** precision; // prettier-ignore

  return `[${Math.floor(a[0] * scale) / scale}, ${Math.floor(a[1] * scale) / scale}, ${Math.floor(a[2] * scale) / scale}]`;
}

var vec3 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  copy: copy,
  set: set,
  equals: equals,
  add: add,
  sub: sub,
  scale: scale,
  addScaled: addScaled,
  multMat4: multMat4,
  multQuat: multQuat,
  dot: dot,
  cross: cross,
  length: length,
  lengthSq: lengthSq,
  normalize: normalize,
  distance: distance,
  distanceSq: distanceSq,
  limit: limit,
  lerp: lerp$1,
  toString: toString
});

export { EPSILON as E, clamp as a, toRadians as b, copy as c, distance as d, scale as e, add as f, length as g, set as h, shallowCopy as i, create as j, dot as k, lerp as l, multMat4 as m, normalize as n, map as o, cross as p, sub as s, toDegrees as t, utils as u, vec3 as v };
