var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var Color = color.Color;

function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return center.add(p);
  }, new Vec3(0, 0, 0));
  center.scale(1 / points.length);
  return center;
}

function elements(list, indices) {
  return indices.map(function(i) { return list[i]; })
}

function FaceNormalHelper(geometry, color) {
  color = color || Color.Pink;
  var length = 0.1;

  var g = new Geometry({ vertices: true, edges: false, faces: false });
  var vertices = geometry.vertices;

  var ab = new Vec3();
  var ac = new Vec3();
  geometry.faces.forEach(function(f) {
    var center = centroid(elements(vertices, f));
    var a = vertices[f[0]];
    var b = vertices[f[1]];
    var c = vertices[f[2]];
    ab.asSub(b, a).normalize();
    ac.asSub(c, a).normalize();
    var n = Vec3.create().asCross(ab, ac);
    g.vertices.push(center);
    g.vertices.push(center.dup().add(n.scale(length)));
  });
  Mesh.call(this, g, new SolidColor({ color: color, pointSize: 10 }), { lines: true });
}

FaceNormalHelper.prototype = Object.create(Mesh.prototype);

module.exports = FaceNormalHelper;