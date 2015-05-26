//3D Vector (x, y, z)
//## Example use
//      var right = new Vec3(0, 1, 0);
//      var forward = new Vec3(0, 0, -1);
//      var up = Vec3.create().asCross(right, foward);

//## Reference

//### Vec3(x, y, z)
//Constructor  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
function Vec3(x, y, z) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
  this.z = z != null ? z : 0;
}

//### create(x, y, z)
//Creates new Vec3 vector from x, y, z numbers  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
Vec3.create = function(x, y, z) {
  return new Vec3(x, y, z);
};

//### fromArray(a)
//Creates new Vec3 from an array  
//`a` - *{ Array of Number }*  
Vec3.fromArray = function(a) {
  return new Vec3(a[0], a[1], a[2]);
}

//### set(x, y, z)
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
Vec3.prototype.set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

//### set(v)
//Sets x, y, z from another Vec3  
//`v` - *{ Vec3 }*  
Vec3.prototype.setVec3 = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  return this;
};

//### equals(v, tolerance)
//Compares this vector to another one with given precision tolerance  
//`v` - *{ Vec3 }*  
//`tolerance` - *{ Number = 0.0000001 }*  
//Returns true if distance between two vectores less than tolerance
Vec3.prototype.equals = function(v, tolerance) {
  if (tolerance == undefined) {
    tolerance = 0.0000001;
  }
  return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance);
};

//### add(v)
//Add another Vec3 to this one  
//`v` - *{ Vec3 }*
Vec3.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
};

//### sub(v)
//Subtracts another vector from this one  
//`v` - *{ Vec3 }*
Vec3.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  return this;
};

//### sub(v)
//Scales this vector
//`f` - *{ Number }*
Vec3.prototype.scale = function(f) {
  this.x *= f;
  this.y *= f;
  this.z *= f;
  return this;
};

//### distance(v)
//Calculates distance to another vector  
//`v` - *{ Vec3 }*
Vec3.prototype.distance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  var dz = v.z - this.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

//### squareDistance(v)
//Calculates distance^2 to another vector  
//`v` - *{ Vec3 }*
Vec3.prototype.squareDistance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  var dz = v.z - this.z;
  return dx * dx + dy * dy + dz * dz;
};

//### simpleDistance(v)
//Calculates distance to another vecor on the shortest axis  
//`v` - *{ Vec3 }*
Vec3.prototype.simpleDistance = function(v) {
  var dx = Math.abs(v.x - this.x);
  var dy = Math.abs(v.y - this.y);
  var dz = Math.abs(v.z - this.z);
  return Math.min(dx, dy, dz);
};

//### copy()
//Copies x, y from another vector to this one  
//`v` - *{ Vec3 }*
Vec3.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  return this;
};

//### clone()
//Returns new vector with x, y the same as this one
Vec3.prototype.clone = function() {
  return new Vec3(this.x, this.y, this.z);
};

//### dup()
//Alias of clone. Returns new vector with x, y the same as this one
Vec3.prototype.dup = function() {
  return this.clone();
};

//### dot(v)
//Computes dot product with another vector  
//`v` - *{ Vec3 }*  
//Returns Number
Vec3.prototype.dot = function(b) {
  return this.x * b.x + this.y * b.y + this.z * b.z;
};

//### cross(v)
//Computes cross product with another vector  
//`v` - *{ Vec3 }*  
//Returns Vec3
Vec3.prototype.cross = function(v) {
  var x = this.x;
  var y = this.y;
  var z = this.z;
  var vx = v.x;
  var vy = v.y;
  var vz = v.z;
  this.x = y * vz - z * vy;
  this.y = z * vx - x * vz;
  this.z = x * vy - y * vx;
  return this;
};

//### asAdd(a, b)
//Sets x, y, z of this vector to the result of adding two other vectors  
//`a` - *{ Vec3 }*  
//`b` - *{ Vec3 }*  
Vec3.prototype.asAdd = function(a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;
  this.z = a.z + b.z;
  return this;
};

//### asSub(a, b)
//Sets x, y, z of this vector to the result of subtracting two other vectors  
//`a` - *{ Vec3 }*  
//`b` - *{ Vec3 }*  
Vec3.prototype.asSub = function(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  return this;
};

//### asCross(a, b)
//Sets x, y, z of this vector to the result of cross product of two other vectors  
//`a` - *{ Vec3 }*  
//`b` - *{ Vec3 }*  
Vec3.prototype.asCross = function(a, b) {
  return this.copy(a).cross(b);
};

//### addScaled(a, f)
//Add another vector with scaling it first  
//`a` - *{ Vec3 }*  
//`f` - *{ Number }*  
Vec3.prototype.addScaled = function(a, f) {
  this.x += a.x * f;
  this.y += a.y * f;
  this.z += a.z * f;
  return this;
};

//### length()
//Computes length of this vector
Vec3.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
};

//### lengthSquared()
//Computes length^2 of this vector
Vec3.prototype.lengthSquared = function() {
  return this.x * this.x + this.y * this.y + this.z * this.z;
};

//### normalize()
//Normalizes this vector (sets length to 1)
Vec3.prototype.normalize = function() {
  var len = this.length();
  if (len > 0) {
    this.scale(1 / len);
  }
  return this;
};

//### normalize()
//Sets length of this vector to a given number  
//`s` - *{ Number }*
Vec3.prototype.limit = function(s) {
  var len = this.length();

  if (len > s && len > 0) {
    this.scale(s / len);
  }

  return this;
};

//### lerp(a, f)
//Interpolates between this and another vector by given factor  
//`v` - *{ Vec3 }*  
//`f` - *{ Number }*  
Vec3.prototype.lerp = function(v, t) {
  this.x = this.x + (v.x - this.x) * t;
  this.y = this.y + (v.y - this.y) * t;
  this.z = this.z + (v.z - this.z) * t;
  return this;
}

//### transformMat4
//Transforms this vector by given matrix  
//`m` - *{ Mat4 }*
Vec3.prototype.transformMat4 = function(m) {
  var x = m.a14 + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
  var y = m.a24 + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
  var z = m.a34 + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
  this.x = x;
  this.y = y;
  this.z = z;
  return this;
};

//### transformQuat
//Transforms this vector by given quaternion  
//`m` - *{ Quat }*
Vec3.prototype.transformQuat = function(q) {
  var x = this.x;
  var y = this.y;
  var z = this.z;
  var qx = q.x;
  var qy = q.y;
  var qz = q.z;
  var qw = q.w;
  var ix = qw * x + qy * z - qz * y;
  var iy = qw * y + qz * x - qx * z;
  var iz = qw * z + qx * y - qy * x;
  var iw = -qx * x - qy * y - qz * z;
  this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
  return this;
};

//### toString()
//Returns string representation of this vector
Vec3.prototype.toString = function() {
  return "{" + Math.floor(this.x*1000)/1000 + ", " + Math.floor(this.y*1000)/1000 + ", " + Math.floor(this.z*1000)/1000 + "}";
};

//### hash()
//Returns naive hash string representation of this vector
Vec3.prototype.hash = function() {
  return 1 * this.x + 12 * this.y + 123 * this.z;
};

Vec3.Zero = new Vec3(0, 0, 0);
Vec3.One  = new Vec3(1, 1, 1);

module.exports = Vec3;
