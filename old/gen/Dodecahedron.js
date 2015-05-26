//Dodecahedron geometry generator.
//Based on http://paulbourke.net/geometry/platonic/

//## Parent class : [geom.Geometry](../pex-geom/Geometry.html)

//## Example use
//      var g = new Dodecahedron(0.5);
//      var mesh = new Mesh(g, new materials.SolidColor());

var geom = require('pex-geom');
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

//### Dodecahedron ( r )  
//`r` - radius *{ Number = 0.5 }*  
function Dodecahedron(r) {
  r = r || 0.5;

  var phi = (1 + Math.sqrt(5)) / 2;
  var a = 0.5;
  var b = 0.5 * 1 / phi;
  var c = 0.5 * (2 - phi);

  var vertices = [
    new Vec3( c,  0,  a),
    new Vec3(-c,  0,  a),
    new Vec3(-b,  b,  b),
    new Vec3( 0,  a,  c),
    new Vec3( b,  b,  b),
    new Vec3( b, -b,  b),
    new Vec3( 0, -a,  c),
    new Vec3(-b, -b,  b),
    new Vec3( c,  0, -a),
    new Vec3(-c,  0, -a),
    new Vec3(-b, -b, -b),
    new Vec3( 0, -a, -c),
    new Vec3( b, -b, -b),
    new Vec3( b,  b, -b),
    new Vec3( 0,  a, -c),
    new Vec3(-b,  b, -b),
    new Vec3( a,  c,  0),
    new Vec3(-a,  c,  0),
    new Vec3(-a, -c,  0),
    new Vec3( a, -c,  0)
  ];

  vertices = vertices.map(function(v) { return v.normalize().scale(r); })

  var faces = [
    [  4,  3,  2,  1,  0 ],
    [  7,  6,  5,  0,  1 ],
    [ 12, 11, 10,  9,  8 ],
    [ 15, 14, 13,  8,  9 ],
    [ 14,  3,  4, 16, 13 ],
    [  3, 14, 15, 17,  2 ],
    [ 11,  6,  7, 18, 10 ],
    [  6, 11, 12, 19,  5 ],
    [  4,  0,  5, 19, 16 ],
    [ 12,  8, 13, 16, 19 ],
    [ 15,  9, 10, 18, 17 ],
    [  7,  1,  2, 17, 18 ]
  ];

  var edges = [
    [  0,  1 ],
    [  0,  4 ],
    [  0,  5 ],
    [  1,  2 ],
    [  1,  7 ],
    [  2,  3 ],
    [  2, 17 ],
    [  3,  4 ],
    [  3, 14 ],
    [  4, 16 ],
    [  5,  6 ],
    [  5, 19 ],
    [  6,  7 ],
    [  6, 11 ],
    [  7, 18 ],
    [  8,  9 ],
    [  8, 12 ],
    [  8, 13 ],
    [  9, 10 ],
    [  9, 15 ],
    [ 10, 11 ],
    [ 10, 18 ],
    [ 11, 12 ],
    [ 12, 19 ],
    [ 13, 14 ],
    [ 13, 16 ],
    [ 14, 15 ],
    [ 15, 17 ],
    [ 16, 19 ],
    [ 17, 18 ]
  ];

  

  Geometry.call(this, { vertices: vertices, faces: faces, edges: edges });
}

Dodecahedron.prototype = Object.create(Geometry.prototype);

module.exports = Dodecahedron;