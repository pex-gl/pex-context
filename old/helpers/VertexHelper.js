var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var Color = color.Color;

function VertexHelper(geometry, color) {
  color = color || Color.Red;

  var g = new Geometry({
    vertices: geometry.vertices.map(function(v) { return v; }),
    edges: false,
    faces: false
  });

  Mesh.call(this, g, new SolidColor({ color: color, pointSize: 10 }), { points: true });
}

VertexHelper.prototype = Object.create(Mesh.prototype);

module.exports = VertexHelper;