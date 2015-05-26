//3D triangle.
//
//Consists of three 3D points: a, b, c

//## Example use
//     var triangle = new Triangle2D(new Vec2(0, 0, 0), new Vec2(1, 0, 0), new Vec2(1, 1, 0));

//## Reference

//### Triangle3D(a, b, c)
//Constructor  
//`a` - *{ Vec3 }*  
//`b` - *{ Vec3 }*  
//`a` - *{ Vec3 }*  
function Triangle3D(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

//### getArea()
//Calculates triangle area using Heron's formula
//http://en.wikipedia.org/wiki/Triangle#Using_Heron.27s_formula
Triangle3D.prototype.getArea = function() {
  var ab = this.a.distance(this.b);
  var ac = this.a.distance(this.c);
  var bc = this.b.distance(this.c);

  var s = (ab + ac + bc) / 2; //perimeter
  return Math.sqrt(s * (s - ab) * (s - ac) * (s - bc));
}

module.exports = Triangle3D;