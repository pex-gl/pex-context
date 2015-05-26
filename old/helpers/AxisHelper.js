var geom = require('pex-geom');
var glu = require('pex-glu');
var materials = require('pex-materials');
var color = require('pex-color');

var Mesh = glu.Mesh;
var Geometry = geom.Geometry;
var Vec3 = geom.Vec3;
var ShowColors = materials.ShowColors;
var Color = color.Color;

function AxisHelper(size) {
  size = size || 1;
  var g = new Geometry({
    vertices: [
      new Vec3(0, 0, 0),
      new Vec3(size, 0, 0),
      new Vec3(0, 0, 0),
      new Vec3(0, size, 0),
      new Vec3(0, 0, 0),
      new Vec3(0, 0, size)
    ],
    colors: [
      Color.Red,
      Color.Red,
      Color.Green,
      Color.Green,
      Color.Blue,
      Color.Blue
    ],
    edges: [
      [0, 1],
      [2, 3],
      [4, 5]
    ]
  });

  Mesh.call(this, g, new ShowColors({ color: color, pointSize: 10 }), { lines: true });
}

AxisHelper.prototype = Object.create(Mesh.prototype);

module.exports = AxisHelper;