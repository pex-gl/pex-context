//Line based geometry generator useful for debugging.

//## Parent class : [Geometry](../pex-geom/Geometry.html)

//## Example use
//      var a = new Vec3(0, 0, 0);
//      var b = new Vec3(1, 0, 0);
//      var c = new Vec3(0, 1, 0);
//      var d = new Vec3(0, 0, 1);
//
//      var lineBuilder = new LineBuilder();
//      lineBuilder.addLine(a, b, Color.Red);
//      lineBuilder.addLine(a, c, Color.Green);
//      lineBuilder.addLine(a, d, Color.Blue);
//      var mesh = new Mesh(lineBuilder, new materials.ShowColors());

var geom = require('pex-geom');
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

function LineBuilder() {
  Geometry.call(this, { vertices: true, colors: true })
}

LineBuilder.prototype = Object.create(Geometry.prototype);

//### addLine ( a, b, colorA, colorB )  
//Draws line between points a and b  
//`a` -  *{ Vec3 = required }*  
//`b` -  *{ Vec3 = required }*  
//`colorA` - start color of the line *{ Color = White }*  
//`colorB` - end color of the line *{ Color = White }*  
LineBuilder.prototype.addLine = function(a, b, colorA, colorB) {
  colorA = colorA || { r: 1, g: 1, b: 1, a: 1 };
  colorB = colorB || colorA;
  this.vertices.push(Vec3.create().copy(a));
  this.vertices.push(Vec3.create().copy(b));
  this.colors.push(colorA);
  this.colors.push(colorB);
  this.vertices.dirty = true;
  this.colors.dirty = true;
  return this;
};

//### addPath ( path, color, numSamples, showPoints )  
//Draws path as a sequence of line segments  
//`path` - path to draw *{ Path/Spline = required }*  
//`color` - line color *{ Color = White }*  
//`numSamples` - line sampling resolution *{ Number/Int = num line points }*  
//`showPoints` - render little crosses representing points *{ bool = false }*  
LineBuilder.prototype.addPath = function(path, color, numSamples, showPoints) {
  numSamples = numSamples || path.points.length;
  color = color || { r: 1, g: 1, b: 1, a: 1 };
  showPoints = showPoints || false;

  var prevPoint = path.getPointAt(0);
  if (showPoints) this.addCross(prevPoint, 0.1, color);
  for(var i=1; i<numSamples; i++) {
    var point;
    if (path.points.length == numSamples) {
      point = path.getPoint(i/(numSamples-1));
    }
    else {
      point = path.getPointAt(i/(numSamples-1));
    }
    this.addLine(prevPoint, point, color);
    prevPoint = point;
    if (showPoints) this.addCross(prevPoint, 0.1, color);
  }
  this.vertices.dirty = true;
  this.colors.dirty = true;
  return this;
}

//### addCross ( pos, size, color )  
//Draws cross at the given point
//`pos` - cross center *{ Vec3 = required }*  
//`size` - cross size *{ Number = 0.1 }*  
//`color` - cross color *{ Color = White }*  
LineBuilder.prototype.addCross = function(pos, size, color) {
  size = size || 0.1;
  var halfSize = size / 2;
  color = color || { r: 1, g: 1, b: 1, a: 1 };
  this.vertices.push(Vec3.create().set(pos.x - halfSize, pos.y, pos.z));
  this.vertices.push(Vec3.create().set(pos.x + halfSize, pos.y, pos.z));
  this.vertices.push(Vec3.create().set(pos.x, pos.y - halfSize, pos.z));
  this.vertices.push(Vec3.create().set(pos.x, pos.y + halfSize, pos.z));
  this.vertices.push(Vec3.create().set(pos.x, pos.y, pos.z - halfSize));
  this.vertices.push(Vec3.create().set(pos.x, pos.y, pos.z + halfSize));
  this.colors.push(color);
  this.colors.push(color);
  this.colors.push(color);
  this.colors.push(color);
  this.colors.push(color);
  this.colors.push(color);
  return this;
};

LineBuilder.prototype.reset = function() {
  this.vertices.length = 0;
  this.colors.length = 0;
  this.vertices.dirty = true;
  this.colors.dirty = true;
  return this;
};

module.exports = LineBuilder;
