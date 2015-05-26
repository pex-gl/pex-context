var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var Color = color.Color;

function VertexNormalHelper(geometry, color) {
  color = color || Color.Orange;
  var length = 0.1;

  if (!geometry.normals) {
    geometry.computeNormals();
  }

  var g = new Geometry({ vertices: true, edges: false, faces: false });
  var vertices = geometry.vertices;
  var normals = geometry.normals;
  vertices.forEach(function(v, vi) {
    var normal = normals[vi];
    g.vertices.push(v, v.dup().add(normal.dup().scale(length)));
  })
  Mesh.call(this, g, new SolidColor({ color: color, pointSize: 10 }), { lines: true });
}

VertexNormalHelper.prototype = Object.create(Mesh.prototype);

module.exports = VertexNormalHelper;