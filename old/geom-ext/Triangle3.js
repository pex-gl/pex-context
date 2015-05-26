function Triangle3(a, b, c) {
  this.a = a;
  this.b = b;
  this.c = c;
}

//http://stackoverflow.com/a/2049593
//doesn't properly handle points on the edge of the triangle
Triangle3.prototype.contains = function (p) {
  var signAB = sign(this.a, this.b, p) < 0;
  var signBC = sign(this.b, this.c, p) < 0;
  var signCA = sign(this.c, this.a, p) < 0;
  return signAB == signBC && signBC == signCA;
};

module.exports = Triangle3;