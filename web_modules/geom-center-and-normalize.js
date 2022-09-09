import './common/web.dom-collections.iterator-13a35a91.js';

/**
 * @module aabb
 */

/**
 * @typedef {number[][]} aabb An axis-aligned bounding box defined by two min and max 3D points.
 */

/**
 * Creates a new bounding box.
 * @returns {aabb}
 */
function create() {
  // [min, max]
  return [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
}
/**
 * Reset a bounding box.
 * @param {aabb} a
 * @returns {rect}
 */

function empty(a) {
  a[0][0] = Infinity;
  a[0][1] = Infinity;
  a[0][2] = Infinity;
  a[1][0] = -Infinity;
  a[1][1] = -Infinity;
  a[1][2] = -Infinity;
  return a;
}
/**
 * Copies a bounding box.
 * @param {aabb} a
 * @returns {aabb}
 */

function copy(a) {
  return [a[0].slice(), a[1].slice()];
}
/**
 * Sets a bounding box to another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
 */

function set(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[0][2] = b[0][2];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  a[1][2] = b[1][2];
  return a;
}
/**
 * Checks if a bounding box is empty.
 * @param {aabb} aabb
 * @returns {boolean}
 */

function isEmpty(a) {
  return a[0][0] > a[1][0] || a[0][1] > a[1][1] || a[0][2] > a[1][2];
}
/**
 * Creates a bounding box from a list of points.
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function fromPoints(points) {
  return setPoints(create(), points);
}
/**
 * Updates a bounding box from a list of points.
 * @param {aabb} a
 * @param {import("pex-math").vec3[]} points
 * @returns {aabb}
 */

function setPoints(a, points) {
  for (let i = 0; i < points.length; i++) {
    includePoint(a, points[i]);
  }

  return a;
}
/**
 * @private
 */

function setVec3(v = [], x, y, z) {
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}
/**
 * Returns a list of 8 points from a bounding box.
 * @param {aabb} aabb
 * @param {import("pex-math").vec3[]} points
 * @returns {import("pex-math").vec3[]}
 */


function getPoints(a, points = []) {
  points[0] = setVec3(points[0], a[0][0], a[0][1], a[0][2]);
  points[1] = setVec3(points[1], a[1][0], a[0][1], a[0][2]);
  points[2] = setVec3(points[2], a[1][0], a[0][1], a[1][2]);
  points[3] = setVec3(points[3], a[0][0], a[0][1], a[1][2]);
  points[4] = setVec3(points[4], a[0][0], a[1][1], a[0][2]);
  points[5] = setVec3(points[5], a[1][0], a[1][1], a[0][2]);
  points[6] = setVec3(points[6], a[1][0], a[1][1], a[1][2]);
  points[7] = setVec3(points[7], a[0][0], a[1][1], a[1][2]);
  return points;
}
/**
 * Returns the center of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function center(a, out = [0, 0, 0]) {
  out[0] = (a[0][0] + a[1][0]) / 2;
  out[1] = (a[0][1] + a[1][1]) / 2;
  out[2] = (a[0][2] + a[1][2]) / 2;
  return out;
}
/**
 * Returns the size of a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} out
 * @returns {import("pex-math").vec3}
 */

function size(a, out = [0, 0, 0]) {
  out[0] = Math.abs(a[1][0] - a[0][0]);
  out[1] = Math.abs(a[1][1] - a[0][1]);
  out[2] = Math.abs(a[1][2] - a[0][2]);
  return out;
}
/**
 * Checks if a point is inside a bounding box.
 * @param {bbox} a
 * @param {import("pex-math").vec3} p
 * @returns {boolean}
 */

function containsPoint(a, [x, y, z]) {
  return x >= a[0][0] && x <= a[1][0] && y >= a[0][1] && y <= a[1][1] && z >= a[0][2] && z <= a[1][2];
}
/**
 * Includes a bounding box in another.
 * @param {aabb} a
 * @param {aabb} b
 * @returns {aabb}
 */

function includeAABB(a, b) {
  if (isEmpty(a)) {
    set(a, b);
  } else if (isEmpty(b)) ; else {
    a[0][0] = Math.min(a[0][0], b[0][0]);
    a[0][1] = Math.min(a[0][1], b[0][1]);
    a[0][2] = Math.min(a[0][2], b[0][2]);
    a[1][0] = Math.max(a[1][0], b[1][0]);
    a[1][1] = Math.max(a[1][1], b[1][1]);
    a[1][2] = Math.max(a[1][2], b[1][2]);
  }

  return a;
}
/**
 * Includes a point in a bounding box.
 * @param {aabb} a
 * @param {import("pex-math").vec3} p
 * @returns {import("pex-math").vec3}
 */

function includePoint(a, p) {
  a[0][0] = Math.min(a[0][0], p[0]);
  a[0][1] = Math.min(a[0][1], p[1]);
  a[0][2] = Math.min(a[0][2], p[2]);
  a[1][0] = Math.max(a[1][0], p[0]);
  a[1][1] = Math.max(a[1][1], p[1]);
  a[1][2] = Math.max(a[1][2], p[2]);
  return a;
}

var aabb = /*#__PURE__*/Object.freeze({
  __proto__: null,
  create: create,
  empty: empty,
  copy: copy,
  set: set,
  isEmpty: isEmpty,
  fromPoints: fromPoints,
  setPoints: setPoints,
  getPoints: getPoints,
  center: center,
  size: size,
  containsPoint: containsPoint,
  includeAABB: includeAABB,
  includePoint: includePoint
});

function create$1() {
  return [0, 0, 0];
}

function equals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function set$1(a, b) {
  a[0] = b[0];
  a[1] = b[1];
  a[2] = b[2];
  return a;
}

function add(a, b) {
  a[0] += b[0];
  a[1] += b[1];
  a[2] += b[2];
  return a;
}

function sub(a, b) {
  a[0] -= b[0];
  a[1] -= b[1];
  a[2] -= b[2];
  return a;
}

function scale(a, n) {
  a[0] *= n;
  a[1] *= n;
  a[2] *= n;
  return a;
}

function multMat4(a, m) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  a[0] = m[0] * x + m[4] * y + m[8] * z + m[12];
  a[1] = m[1] * x + m[5] * y + m[9] * z + m[13];
  a[2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  return a;
}

function multQuat(a, q) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var qx = q[0];
  var qy = q[1];
  var qz = q[2];
  var qw = q[3];
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;
  a[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  a[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  a[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return a;
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var vx = b[0];
  var vy = b[1];
  var vz = b[2];
  a[0] = y * vz - vy * z;
  a[1] = z * vx - vz * x;
  a[2] = x * vy - vx * y;
  return a;
}

function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.sqrt(x * x + y * y + z * z);
}

function lengthSq(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}

function normalize(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var l = Math.sqrt(x * x + y * y + z * z);
  l = 1.0 / (l || 1);
  a[0] *= l;
  a[1] *= l;
  a[2] *= l;
  return a;
}

function distance(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function distanceSq(a, b) {
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz;
}

function limit(a, n) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var dsq = x * x + y * y + z * z;
  var lsq = n * n;

  if (lsq > 0 && dsq > lsq) {
    var nd = n / Math.sqrt(dsq);
    a[0] *= nd;
    a[1] *= nd;
    a[2] *= nd;
  }

  return a;
}

function lerp(a, b, n) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  a[0] = x + (b[0] - x) * n;
  a[1] = y + (b[1] - y) * n;
  a[2] = z + (b[2] - z) * n;
  return a;
}

function toString(a, precision) {
  var scale = Math.pow(10, precision !== undefined ? precision : 4);
  var s = '[';
  s += Math.floor(a[0] * scale) / scale + ', ';
  s += Math.floor(a[1] * scale) / scale + ', ';
  s += Math.floor(a[2] * scale) / scale + ']';
  return s;
}

function copy$1(a) {
  return a.slice(0);
}

function addScaled(v, w, n) {
  v[0] += w[0] * n;
  v[1] += w[1] * n;
  v[2] += w[2] * n;
  return v;
}

var Vec3 = {
  create: create$1,
  set: set$1,
  copy: copy$1,
  equals: equals,
  add: add,
  addScaled: addScaled,
  sub: sub,
  scale: scale,
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
  lerp: lerp,
  toString: toString
};
var vec3 = Vec3;

function centerAndNormalize(positions) {
  var result = aabb.fromPoints(positions);
  var center = aabb.center(result);
  var size = aabb.size(result);
  var scale = Math.max(size[0], Math.max(size[1], size[2]));
  var newPositions = [];

  for (var i = 0; i < positions.length; i++) {
    var p = vec3.copy(positions[i]);
    vec3.sub(p, center);
    vec3.scale(p, 1 / scale);
    newPositions.push(p);
  }

  return newPositions;
}

var geomCenterAndNormalize = centerAndNormalize;

export default geomCenterAndNormalize;
