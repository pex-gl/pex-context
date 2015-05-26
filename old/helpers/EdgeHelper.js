var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Mesh = glu.Mesh;
var Geometry = geom.Geometry;
var SolidColor = materials.SolidColor;
var Color = color.Color;

function EdgeHelper(geometry, color) {
  color = color || Color.Yellow;

  if (!geometry.edges) {
    geometry.computeEdges();
  }

  var g = new Geometry({
    vertices: geometry.vertices.map(function(v) { return v; }),
    edges: geometry.edges.map(function(e) { return e; })
  });

  Mesh.call(this, g, new SolidColor({ color: color, pointSize: 10 }), { lines: true });
}

EdgeHelper.prototype = Object.create(Mesh.prototype);

module.exports = EdgeHelper;