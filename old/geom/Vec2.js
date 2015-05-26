//2D Vector (x, y)
//## Example use
//      var position = new Vec2(0, 0);
//      var speed = new Vec2(1, 0);
//      position.addScaled(speed, Time.delta);

//## Reference

//### Vec2(x, y)
//Constructor  
//`x` - *{ Number }*  
//`y` - *{ Number }*  
//`z` - *{ Number }*  
function Vec2(x, y) {
  this.x = x != null ? x : 0;
  this.y = y != null ? y : 0;
}

//### create(x, y)
//Creates new Vec2 vector x, y numbers 
//`x` - *{ Number }*  
//`y` - *{ Number }*  
Vec2.create = function(x, y) {
  return new Vec2(x, y);
};

//### fromArray(a)
//Creates new Vec2 from an array  
//`a` - *{ Array of Number }*  
Vec2.fromArray = function(a) {
  return new Vec2(a[0], a[1]);
}

//### fromDirection(a)
//Creates new Vec2 from direction  
//`angle` - *{ Number }*  
//`dist` - distance / length of the vector *{ Number }*  
Vec2.fromDirection = function(angle, dist) {
  return new Vec2().setDirection(angle, dist);
}


//### set(x, y, z)
//`x` - *{ Number }*  
//`y` - *{ Number }*  
Vec2.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

//### set(v)
//Sets x, y from another Vec2  
//`v` - *{ Vec2 }*  
Vec2.prototype.setVec2 = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};

//### setDirection(a)
//Sets vectors x and y from direction  
//`angle` - *{ Number }*  
//`dist` - distance / length of the vector *{ Number }*  
Vec2.prototype.setDirection = function(angle, dist) {
  dist = dist || 1;

  this.x = dist * Math.cos(angle / 360 * Math.PI * 2);
  this.y = dist * Math.sin(angle / 360 * Math.PI * 2);

  return this;
};

//### equals(v, tolerance)
//Compares this vector to another one with given precision tolerance  
//`v` - *{ Vec2 }*  
//`tolerance` - *{ Number = 0.0000001 }*  
//Returns true if distance between two vectores less than tolerance
Vec2.prototype.equals = function(v, tolerance) {
  if (tolerance == null) {
    tolerance = 0.0000001;
  }
  return (Math.abs(v.x - this.x) <= tolerance) && (Math.abs(v.y - this.y) <= tolerance);
};

//### add(v)
//Add another Vec2 to this one  
//`v` - *{ Vec2 }*
Vec2.prototype.add = function(v) {
  this.x += v.x;
  this.y += v.y;
  return this;
};

//### sub(v)
//Subtracts another vector from this one  
//`v` - *{ Vec2 }*
Vec2.prototype.sub = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  return this;
};

//### sub(v)
//Scales this vector
//`f` - *{ Number }*
Vec2.prototype.scale = function(f) {
  this.x *= f;
  this.y *= f;
  return this;
};

//### distance(v)
//Calculates distance to another vector  
//`v` - *{ Vec2 }*
Vec2.prototype.distance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  return Math.sqrt(dx * dx + dy * dy);
};

//### squareDistance(v)
//Calculates distance^2 to another vector  
//`v` - *{ Vec2 }*
Vec2.prototype.squareDistance = function(v) {
  var dx = v.x - this.x;
  var dy = v.y - this.y;
  return dx * dx + dy * dy;
};

//### simpleDistance(v)
//Calculates distance to another vecor on the shortest axis  
//`v` - *{ Vec2 }*
Vec2.prototype.simpleDistance = function(v) {
  var dx = Math.abs(v.x - this.x);
  var dy = Math.abs(v.y - this.y);
  return Math.min(dx, dy);
};

//### copy()
//Copies x, y from another vector to this one  
//`v` - *{ Vec2 }*
Vec2.prototype.copy = function(v) {
  this.x = v.x;
  this.y = v.y;
  return this;
};

//### clone()
//Returns new vector with x, y the same as this one
Vec2.prototype.clone = function() {
  return new Vec2(this.x, this.y);
};

//### dup()
//Alias of clone. Returns new vector with x, y the same as this one
Vec2.prototype.dup = function() {
  return this.clone();
};

//### dot(v)
//Computes dot product with another vector  
//`v` - *{ Vec2 }*
//Returns Number
Vec2.prototype.dot = function(b) {
  return this.x * b.x + this.y * b.y;
};

//### asAdd(a, b)
//Sets x, y of this vector to the result of adding two other vectors  
//`a` - *{ Vec2 }*  
//`b` - *{ Vec2 }*  
Vec2.prototype.asAdd = function(a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;
  return this;
};

//### asSub(a, b)
//Sets x, y of this vector to the result of subtracting two other vectors  
//`a` - *{ Vec2 }*  
//`b` - *{ Vec2 }*  
Vec2.prototype.asSub = function(a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  return this;
};

//### addScaled(a, f)
//Add another vector with scaling it first  
//`a` - *{ Vec2}*  
//`f` - *{ Number }*  
Vec2.prototype.addScaled = function(a, f) {
  this.x += a.x * f;
  this.y += a.y * f;
  return this;
};

//### add
Vec2.prototype.direction = function() {
  var rad = Math.atan2(this.y, this.x);
  var deg = rad * 180 / Math.PI;
  if (deg < 0) deg = 360 + deg;

  return deg;
};

//### length()
//Computes length of this vector
Vec2.prototype.length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

//### lengthSquared()
//Computes length^2 of this vector
Vec2.prototype.lengthSquared = function() {
  return this.x * this.x + this.y * this.y;
};

//### normalize()
//Normalizes this vector (sets length to 1)
Vec2.prototype.normalize = function() {
  var len = this.length();
  if (len > 0) {
    this.scale(1 / len);
  }
  return this;
};

//### normalize()
//Sets length of this vector to a given number  
//`s` - *{ Number }*
Vec2.prototype.limit = function(s) {
  var len = this.length();

  if (len > s && len > 0) {
    this.scale(s / len);
  }

  return this;
};

//### lerp(a, f)
//Interpolates between this and another vector by given factor  
//`v` - *{ Vec2 }*  
//`f` - *{ Number }*  
Vec2.prototype.lerp = function(v, t) {
  this.x = this.x + (v.x - this.x) * t;
  this.y = this.y + (v.y - this.y) * t;
  return this;
}

//### toString()
//Returns string representation of this vector
Vec2.prototype.toString = function() {
  return "{" + Math.floor(this.x*1000)/1000 + ", " + Math.floor(this.y*1000)/1000 + "}";
};

//### hash()
//Returns naive hash string representation of this vector
Vec2.prototype.hash = function() {
  return 1 * this.x + 12 * this.y;
};

Vec2.Zero = new Vec2(0, 0);
Vec2.One  = new Vec2(1, 1);

module.exports = Vec2;
