//2D triangle.
//
//Consists of three 2D points: a, b, c

//## Example use
//     var triangle = new Triangle2D(new Vec2(0, 0, 0), new Vec2(1, 0, 0), new Vec2(1, 1, 0));

//## Reference

//### Triangle2D(a, b, c)
//Constructor  
//`a` - *{ Vec2 }*  
//`b` - *{ Vec2 }*  
//`a` - *{ Vec2 }*  
function Triangle2D(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

//### contains(p)
//Returs true if point lies inside the triangle, false otherwise  
//http://stackoverflow.com/a/2049593  
//WARNING doesn't properly handle points on the edge of the triangle  
Triangle2D.prototype.contains = function (p) {
  var signAB = sign(this.a, this.b, p) < 0;
  var signBC = sign(this.b, this.c, p) < 0;
  var signCA = sign(this.c, this.a, p) < 0;
  return signAB == signBC && signBC == signCA;
};

//### getArea()
//Calculates triangle area using Heron's formula  
//http://en.wikipedia.org/wiki/Triangle#Using_Heron.27s_formula  
Triangle2D.prototype.getArea = function() {
  var ab = this.a.distance(this.b);
  var ac = this.a.distance(this.c);
  var bc = this.b.distance(this.c);

  var s = (ab + ac + bc) / 2; //perimeter
  return Math.sqrt(s * (s - ab) * (s - ac) * (s - bc));
}

//Utility function returns *{ Number }* > 0 if point C is on the left side of the AB line, negative if on the right side
function sign(a, b, c) {
  return (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
}

module.exports = Triangle2D;