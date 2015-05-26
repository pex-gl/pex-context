//Tetrahedron geometry generator.
//Based on http://mathworld.wolfram.com/RegularTetrahedron.html

//## Parent class : [Geometry](../pex-geom/Geometry.html)

//## Example use
//      var g = new Tetrahedron(0.5);
//      var mesh = new Mesh(g, new Materials.SolidColor());

var geom = require('pex-geom');
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

//### Tetrahedron ( r )  
//`r` - radius *{ Number = 0.5 }*  
function Tetrahedron(r) {
  r = r || 0.5;

  var s3 = Math.sqrt(3);
  var s6 = Math.sqrt(6);

  var vertices = [
    new Vec3( s3/3, -s6/3 * 0.333 + s6*0.025,    0),   //right
    new Vec3(-s3/6, -s6/3 * 0.333 + s6*0.025,  1/2),   //left front
    new Vec3(-s3/6, -s6/3 * 0.333 + s6*0.025, -1/2),   //left back
    new Vec3(    0,  s6/3 * 0.666 + s6*0.025,    0)    //top
  ];;

  vertices = vertices.map(function(v) { return v.normalize().scale(r); })

  var faces = [
    [0, 1, 2],
    [3, 1, 0],
    [3, 0, 2],
    [3, 2, 1]
  ];

  var edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3]
  ];

  Geometry.call(this, { vertices: vertices, faces: faces, edges: edges });
}

Tetrahedron.prototype = Object.create(Geometry.prototype);

module.exports = Tetrahedron;