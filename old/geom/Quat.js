//A Quaternion (x, y, z, w)
//## Example use
//     var q = new Quat().fromDirection(new Vec3(1, 1, 1));
//     var v = new Vec3(0, 0, 1);
//     v.transformQuat(q);
//
//## Reference

var Mat4 = require('./Mat4');
var Vec3 = require('./Vec3');
var kEpsilon = Math.pow(2, -24);

//### Quat(x, y, z, w)
//Constructor  
//`x` - *{ Number }* = 0  
//`y` - *{ Number }* = 0  
//`z` - *{ Number }* = 0  
//`w` - *{ Number }* = 1  
function Quat(x, y, z, w) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
  this.z = z != null ? z : 0;
  this.w = w != null ? w : 1;
}

//### create(x, y, z, w)
//Creates new Quaternion  
//`x` - *{ Number }* = 0  
//`y` - *{ Number }* = 0  
//`z` - *{ Number }* = 0  
//`w` - *{ Number }* = 1  
//returns *{ Quat }*  
Quat.create = function(x, y, z, w) {
  return new Quat(x, y, z, w);
};

//### create(x, y, z, w)
//Creates new Quaternion from an array  
//`a` - *{ Array of Number}*  
//returns *{ Quat }*
Quat.fromArray = function(a) {
  return new Quat(a[0], a[1], a[2], a[3]);
}

//### identity()
//Resets Quaternion to it's inital state (0, 0, 0, 1), with no rotation
Quat.prototype.identity = function() {
  this.set(0, 0, 0, 1);
  return this;
};

//### equals(q, tolerance)
//Compares two quaternions with given tolerance  
//`q` - *{ Quat }*  
//`tolerance` - *{ Number }* = 0.0000001  
Quat.prototype.equals = function(q, tolerance) {
  if (tolerance == null) {
    tolerance = 0.0000001;
  }
  return (Math.abs(q.x - this.x) <= tolerance) && (Math.abs(q.y - this.y) <= tolerance) && (Math.abs(q.z - this.z) <= tolerance) && (Math.abs(q.w - this.w) <= tolerance);
};


//### hash()
//Returns naive hash string representation of this quaternion
Quat.prototype.hash = function() {
  return 1 * this.x + 12 * this.y + 123 * this.z + 1234 * this.w;
};

//### copy()
//Copies x, y, z, w from another quaternion to this one  
//`q` - *{ Quat }*
Quat.prototype.copy = function(q) {
  this.x = q.x;
  this.y = q.y;
  this.z = q.z;
  this.w = q.w;
  return this;
};

//### clone()
//Returns new quaternion with x, y, z, w the same as this one
Quat.prototype.clone = function() {
  return new Quat(this.x, this.y, this.z, this.w);
};

//### dup()
//Alias of clone. Returns new quaternion with x, y, z, w the same as this one
Quat.prototype.dup = function() {
  return this.clone();
};

//### setAxisAngle(v, z)
//Sets x, y, z, w of the Quaternion representing rotation around given axis
//`v` - *{ Vec3 }*
//`a` - angle in degrees *{ Number }*
Quat.prototype.setAxisAngle = function(v, a) {
  a = a * 0.5;
  var s = Math.sin(a / 180 * Math.PI);
  this.x = s * v.x;
  this.y = s * v.y;
  this.z = s * v.z;
  this.w = Math.cos(a / 180 * Math.PI);
  return this;
};

//### set(q)
//Sets x, y, z, w from another Quat  
//`q` - *{ Quat }*  
Quat.prototype.setQuat = function(q) {
  this.x = q.x;
  this.y = q.y;
  this.z = q.z;
  this.w = q.w;
  return this;
};

//### set(x, y, z, w)
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
//`w` - *{ Number }*  
Quat.prototype.set = function(x, y, z, w) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
  return this;
};

//### asMul(p, q)
//Sets x, y, z, w of this quaternion to the result of multiplying two other quaternions  
//`p` - *{ Quat }*  
//`q` - *{ Quat }*  
Quat.prototype.asMul = function(p, q) {
  var px = p.x;
  var py = p.y;
  var pz = p.z;
  var pw = p.w;
  var qx = q.x;
  var qy = q.y;
  var qz = q.z;
  var qw = q.w;
  this.x = px * qw + pw * qx + py * qz - pz * qy;
  this.y = py * qw + pw * qy + pz * qx - px * qz;
  this.z = pz * qw + pw * qz + px * qy - py * qx;
  this.w = pw * qw - px * qx - py * qy - pz * qz;
  return this;
};

//### mul(q)
//Multiply this quaternion by another quaternion  
//`q` - *{ Quat }*  
Quat.prototype.mul = function(q) {
  this.asMul(this, q);
  return this;
};

//### mul3(q)
//Multiply this quaternion by another quaternion represented by x, y, z, w  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
//`w` - *{ Number }*  
Quat.prototype.mul4 = function(x, y, z, w) {
  var ax = this.x;
  var ay = this.y;
  var az = this.z;
  var aw = this.w;
  this.x = w * ax + x * aw + y * az - z * ay;
  this.y = w * ay + y * aw + z * ax - x * az;
  this.z = w * az + z * aw + x * ay - y * ax;
  this.w = w * aw - x * ax - y * ay - z * az;
  return this;
};

//### length()
//Returns length of this quaternion *{ Number }*  
Quat.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
};

//### normalize()
//Sets length of this quaternion to 1  
Quat.prototype.normalize = function() {
  var len = this.length();
  if (len > kEpsilon) {
    this.x /= len;
    this.y /= len;
    this.z /= len;
    this.w /= len;
  }
  return this;
};

//### toMat4()
//Returns this quaternion represented as 4x4 matrix  
//`out` - optional matrix to write data into *{ Mat4 }*  
Quat.prototype.toMat4 = function(out) {
  var xs = this.x + this.x;
  var ys = this.y + this.y;
  var zs = this.z + this.z;
  var wx = this.w * xs;
  var wy = this.w * ys;
  var wz = this.w * zs;
  var xx = this.x * xs;
  var xy = this.x * ys;
  var xz = this.x * zs;
  var yy = this.y * ys;
  var yz = this.y * zs;
  var zz = this.z * zs;
  var m = out || new Mat4();
  return m.set4x4r(1 - (yy + zz), xy - wz, xz + wy, 0, xy + wz, 1 - (xx + zz), yz - wx, 0, xz - wy, yz + wx, 1 - (xx + yy), 0, 0, 0, 0, 1);
};

//### setDirection(direction)
//Sets x, y, z, w of this quaternion to represent rotation of Z axis towards given vector  
//`direction` - *{ Vec3 }*  
Quat.prototype.setDirection = function(direction) {
  var dir = Vec3.create().copy(direction).normalize();

  var up = Vec3.create(0, 1, 0);

  var right = Vec3.create().asCross(up, dir);

  if (right.length() == 0) {
    up.set(1, 0, 0)
    right.asCross(up, dir);
  }

  up.asCross(dir, right);
  right.normalize();
  up.normalize();

  var m = new Mat4();
  m.set4x4r(
    right.x, right.y, right.z, 0,
    up.x, up.y, up.z, 0,
    dir.x, dir.y, dir.z, 0,
    0, 0, 0, 1
  );

  //Step 3. Build a quaternion from the matrix
  var q = new Quat()
  if (1.0 + m.a11 + m.a22 + m.a33 < 0.001) {
    dir = direction.dup();
    dir.z *= -1;
    dir.normalize();
    up.set(0, 1, 0);
    right.asCross(up, dir);
    up.asCross(dir, right);
    right.normalize();
    up.normalize();
    m = new Mat4();
    m.set4x4r(
      right.x, right.y, right.z, 0,
      up.x, up.y, up.z, 0,
      dir.x, dir.y, dir.z, 0,
      0, 0, 0, 1
    );
    q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
    var dfWScale = q.w * 4.0;
    q.x = ((m.a23 - m.a32) / dfWScale);
    q.y = ((m.a31 - m.a13) / dfWScale);
    q.z = ((m.a12 - m.a21) / dfWScale);

    q2 = new Quat();
    q2.setAxisAngle(new Vec3(0,1,0), 180)
    q2.mul(q);
    this.copy(q2);
    return this;
  }
  q.w = Math.sqrt(1.0 + m.a11 + m.a22 + m.a33) / 2.0;
  dfWScale = q.w * 4.0;
  q.x = ((m.a23 - m.a32) / dfWScale);
  q.y = ((m.a31 - m.a13) / dfWScale);
  q.z = ((m.a12 - m.a21) / dfWScale);

  this.copy(q);
  return this;
}

//### slerp(qb, t)
//Spherical linear interpolation of this quaternion towards another quaternion  
//`q` - quaternion to rotate towards *{ Quat }*  
//`t` - interpolation fraction aka 'time' *{ Number }*  
Quat.prototype.slerp = function(qb, t) {
  var qa = this;

  // Calculate angle between the quaternions
  var cosHalfTheta = qa.w * qb.w + qa.x * qb.x + qa.y * qb.y + qa.z * qb.z;

  // If qa=qb or qa=-qb then theta = 0 and we can return qa
  if (Math.abs(cosHalfTheta) >= 1.0){
    return this;
  }

  var halfTheta = Math.acos(cosHalfTheta);
  var sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta*cosHalfTheta);

  // If theta = 180 degrees then result is not fully defined
  // we could rotate around any axis normal to qa or qb
  if (Math.abs(sinHalfTheta) < 0.001){ // fabs is floating point absolute
    this.w = (qa.w * 0.5 + qb.w * 0.5);
    this.x = (qa.x * 0.5 + qb.x * 0.5);
    this.y = (qa.y * 0.5 + qb.y * 0.5);
    this.z = (qa.z * 0.5 + qb.z * 0.5);
    return this;
  }

  var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
  var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

  this.w = (qa.w * ratioA + qb.w * ratioB);
  this.x = (qa.x * ratioA + qb.x * ratioB);
  this.y = (qa.y * ratioA + qb.y * ratioB);
  this.z = (qa.z * ratioA + qb.z * ratioB);
  return this;
}

//### Quat.fromAxisAngle(v, a)
//Creates new quaternion Quaternion representing rotation around given axis  
//`v` - *{ Vec3 }*  
//`a` - angle in degrees *{ Number }*  
Quat.fromAxisAngle = function(v, a) {
  return new Quat().setAxisAngle(v, a);
}

//### Quat.fromDirection(direction)
//Creates new quaternion Quaternion representing rotation of Z axis towards given vector  
//`direction` - *{ Vec3 }*  
Quat.fromDirection = function(direction) {
  return new Quat().setDirection(direction);
}


module.exports = Quat;
