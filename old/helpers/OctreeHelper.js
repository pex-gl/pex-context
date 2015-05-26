var geom = require('pex-geom');
var glu = require('pex-glu');
var gen = require('pex-gen');
var materials = require('pex-materials');
var color = require('pex-color');

var Geometry = geom.Geometry;
var Mesh = glu.Mesh;
var SolidColor = materials.SolidColor;
var Color = color.Color;
var Box = gen.Box;

function OctreeHelper(octree, color, level) {
  color = color || Color.Red;
  level = (typeof(level) != 'undefined') ? level : 3;
  this.cells = octree.getAllCellsAtLevel(level);
  this.octree = octree;
  var geometry = new Box();
  geometry.computeEdges();
  Mesh.call(this, geometry, new SolidColor({ color: color, pointSize: 10 }), { lines: true });
}

OctreeHelper.prototype = Object.create(Mesh.prototype);

OctreeHelper.prototype.draw = function(camera) {
  this.cells.forEach(function(cell) {
    this.position.x = cell.position.x + cell.size.x / 2;
    this.position.y = cell.position.y + cell.size.y / 2;
    this.position.z = cell.position.z + cell.size.z / 2;
    this.scale.x = cell.size.x;
    this.scale.y = cell.size.y;
    this.scale.z = cell.size.z;
    Mesh.prototype.draw.call(this, camera);
  }.bind(this));
}

module.exports = OctreeHelper;