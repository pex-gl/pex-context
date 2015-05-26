var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var Color = color.Color;

function FaceHelper(geometry, color) {
  color = color || Color.Green;
  var g = new Geometry({
    vertices: true,
    edges: false,
    faces: false
  });
  geometry.faces.forEach(function(face) {
    var faceVertices = face.map(function(vi) {
      return geometry.vertices[vi];
    });

    var center = faceVertices.reduce(function(c, v) {
      return c.add(v);
    }, new Vec3(0,0,0))
    center.scale(1/faceVertices.length);

    var a = faceVertices[0];
    var b = faceVertices[1];
    var c = faceVertices[2];
    var ab = Vec3.create().asSub(b, a);
    var ac = Vec3.create().asSub(c, a);
    var normal = Vec3.create().asCross(ab, ac).normalize();
    var scaledNormal = normal.dup().scale(0.005);

    faceVertices.forEach(function(v, vi) {
      var vn = faceVertices[(vi + 1)%face.length];
      var d = vn.dup().sub(v).scale(0.2).add(v);
      g.vertices.push(center.dup().sub(v).scale(0.05).add(v).add(scaledNormal));
      g.vertices.push(center.dup().sub(d).scale(0.05).add(d).add(scaledNormal));
    });
  })
  Mesh.call(this, g, new SolidColor({ color: color, pointSize: 10 }), { lines: true });
}

FaceHelper.prototype = Object.create(Mesh.prototype);

module.exports = FaceHelper;