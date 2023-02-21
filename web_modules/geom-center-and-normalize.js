function create() {
  var min = [Infinity, Infinity, Infinity];
  var max = [-Infinity, -Infinity, -Infinity];
  return [min, max];
}
function set(a, b) {
  a[0][0] = b[0][0];
  a[0][1] = b[0][1];
  a[0][2] = b[0][2];
  a[1][0] = b[1][0];
  a[1][1] = b[1][1];
  a[1][2] = b[1][2];
}
function copy(b) {
  var a = create();
  set(a, b);
  return a;
}
function fromPoints(points) {
  var aabb = create();
  var min = aabb[0];
  var max = aabb[1];
  for (var i = 0, len = points.length; i < len; i++) {
    var p = points[i];
    min[0] = Math.min(min[0], p[0]);
    min[1] = Math.min(min[1], p[1]);
    min[2] = Math.min(min[2], p[2]);
    max[0] = Math.max(max[0], p[0]);
    max[1] = Math.max(max[1], p[1]);
    max[2] = Math.max(max[2], p[2]);
  }
  return aabb;
}
function center(aabb, out) {
  if (out === undefined) {
    out = [0, 0, 0];
  }
  out[0] = (aabb[0][0] + aabb[1][0]) / 2;
  out[1] = (aabb[0][1] + aabb[1][1]) / 2;
  out[2] = (aabb[0][2] + aabb[1][2]) / 2;
  return out;
}
function size(aabb, out) {
  if (out === undefined) {
    out = [0, 0, 0];
  }
  out[0] = Math.abs(aabb[1][0] - aabb[0][0]);
  out[1] = Math.abs(aabb[1][1] - aabb[0][1]);
  out[2] = Math.abs(aabb[1][2] - aabb[0][2]);
  return out;
}
function isEmpty(aabb) {
  return aabb[0][0] > aabb[1][0] || aabb[0][1] > aabb[1][1] || aabb[0][2] > aabb[1][2];
}
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
function includePoint(a, p) {
  a[0][0] = Math.min(a[0][0], p[0]);
  a[0][1] = Math.min(a[0][1], p[1]);
  a[0][2] = Math.min(a[0][2], p[2]);
  a[1][0] = Math.max(a[1][0], p[0]);
  a[1][1] = Math.max(a[1][1], p[1]);
  a[1][2] = Math.max(a[1][2], p[2]);
  return a;
}
var aabb = {
  create: create,
  set: set,
  copy: copy,
  fromPoints: fromPoints,
  center: center,
  size: size,
  isEmpty: isEmpty,
  includeAABB: includeAABB,
  includePoint: includePoint
};

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
