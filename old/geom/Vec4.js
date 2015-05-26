//4D Vector (x, y, z, w)
//## Example use
//      var a = new Vec4(0.2, 0.4, 3.3, 1.0);

//## Reference

//### Vec4(x, y, z, w)
//Constructor  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
//`w` - *{ Number }*  
function Vec4(x, y, z, w) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
  this.z = z != null ? z : 0;
  this.w = w != null ? w : 0;
}

//### create(x, y, z)
//Creates new Vec4 vector x, y, z, w numbers  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
//`w` - *{ Number }*  
Vec4.create = function(x, y, z, w) {
  return new Vec4(x, y, z, w);
};

//### fromArray(a)
//Creates new Vec4 from an array  
//`a` - *{ Array of Number }*  
Vec4.fromArray = function(a) {
  return new Vec4(a[0], a[1], a[2], a[3]);
}

//### set(x, y, z, w)
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
//`w` - *{ Number }*  
Vec4.prototype.set = function(x, y, z, w) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
  return this;
};

//### set(v)
//Sets x, y, z, w from another Vec4  
//`v` - *{ Vec4 }*  
Vec4.prototype.setVec4 = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  this.w = v.w;
  return this;
};

//### equals(v, tolerance)
//Compares this vector to another one with given precision tolerance  
//`v` - *{ Vec4 }*  
//`tolerance` - *{ Number = 0.0000001 }*  
//Returns true if distance between two vectores less than tolerance
Vec4.prototype.equals = function(v, tolerance) {
  if (tolerance == null) {
    tolerance = 0.0000001;
  }
  return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance) && (Math.abs(v.z - this.z) <= tolerance) && (Math.abs(v.w - this.w) <= tolerance);
};

//### transformMat4
//Transforms this vector by given matrix  
//`m` - *{ Mat4 }*
Vec4.prototype.transformMat4 = function(m) {
  var x = m.a14 * this.w + m.a11 * this.x + m.a12 * this.y + m.a13 * this.z;
  var y = m.a24 * this.w + m.a21 * this.x + m.a22 * this.y + m.a23 * this.z;
  var z = m.a34 * this.w + m.a31 * this.x + m.a32 * this.y + m.a33 * this.z;
  var w = m.a44 * this.w + m.a41 * this.x + m.a42 * this.y + m.a43 * this.z;
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
  return this;
};

//### toString()
//Returns string representation of this vector
Vec4.prototype.toString = function() {
  return "{" + Math.floor(this.x*1000)/1000 + ", " + Math.floor(this.y*1000)/1000 + ", " + Math.floor(this.z*1000)/1000 + ", " + Math.floor(this.w*1000)/1000 + "}";
};

//### hash()
//Returns naive hash string representation of this vector
Vec4.prototype.hash = function() {
  return 1 * this.x + 12 * this.y + 123 * this.z + 1234 * this.w;
};

Vec4.Zero = new Vec4(0, 0, 0, 0);
Vec4.One  = new Vec4(1, 1, 1, 1);

module.exports = Vec4;
