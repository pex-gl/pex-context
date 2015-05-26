//Cylinder geometry generator.

//## Parent class : [geom.Geometry](../pex-geom/Geometry.html)

//## Example use
//      var g = new Cylinder(0.5, 0.5, 1, 8, 4);
//      var mesh = new Mesh(g, new materials.SolidColor());

var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

//### Cylinder ( rBottom, rTop, height, numSides, numSegments, bottomCap, topCap, centered )
//`rBottom` - bottom radius *{ Number = 0.5 }*  
//`rTop` - top radius *{ Number = 0.5 }*  
//`height` - height *{ Number = 1 }*  
//`numSides` - number of subdivisions on XZ axis *{ Number = 8 }*  
//`numSegments` - number of subdivisions on Y axis *{ Number = 4 }*  
//`bottomCap` - generate bottom cap faces *{ bool = true }*  
//`topCap` - generate top cap faces *{ bool = true }*  
//`centered` - center around (0,0,0) *{ bool = true }*
function Cylinder(rBottom, rTop, height, numSides, numSegments, bottomCap, topCap, centered) {
  rTop = rTop != null ? rTop : 0.5;
  rBottom = rBottom != null ? rBottom : 0.5;
  height = height != null ? height : 1;
  numSides = numSides != null ? numSides : 8;
  numSegments = numSegments != null ? numSegments : 4;
  bottomCap = bottomCap != null ? bottomCap : true;
  topCap = topCap != null ? topCap : true;
  centered = centered != null ? centered : true;

  Geometry.call(this, { vertices: true, normals: true, texCoords: true, faces: true });

  var vertices = this.vertices;
  var texCoords = this.texCoords;
  var normals = this.normals;
  var faces = this.faces;

  var index = 0;

  var offsetY = -height/2;
  if (!centered) {
    offsetY = 0;
  }

  for(var j=0; j<=numSegments; j++) {
    for(var i=0; i<=numSides; i++) {
      var r = rBottom + (rTop - rBottom) * j/numSegments;
      var y = offsetY + height * j/numSegments;
      var x = r * Math.cos(i/numSides * Math.PI * 2);
      var z = r * Math.sin(i/numSides * Math.PI * 2);
      vertices.push(new Vec3( x, y, z));
      normals.push(new Vec3(x, 0, z));
      texCoords.push(new Vec2(i/numSides, j/numSegments));
      if (i < numSides && j<numSegments) {
        faces.push([ index + 1, index, index + numSides + 1, index + numSides + 1 + 1])
      }
      index++;
    }
  }

  if (bottomCap) {
    vertices.push(new Vec3(0, offsetY, 0));
    normals.push(new Vec3(0, -1, 0));
    texCoords.push(new Vec2(0, 0));
    var centerIndex = index;
    index++;
    for(var i=0; i<=numSides; i++) {
      var y = offsetY;
      var x = rBottom * Math.cos(i/numSides * Math.PI * 2);
      var z = rBottom * Math.sin(i/numSides * Math.PI * 2);
      vertices.push(new Vec3( x, y, z));
      if (i < numSides) {
        faces.push([ index, index + 1, centerIndex ])
      }
      normals.push(new Vec3(0, -1, 0));
      texCoords.push(new Vec2(0, 0));
      index++;
    }
  }

  if (topCap) {
    vertices.push(new Vec3(0, offsetY + height, 0));
    normals.push(new Vec3(0, 1, 0));
    texCoords.push(new Vec2(0, 0));
    var centerIndex = index;
    index++;
    for(var i=0; i<=numSides; i++) {
      var y = offsetY + height;
      var x = rTop * Math.cos(i/numSides * Math.PI * 2);
      var z = rTop * Math.sin(i/numSides * Math.PI * 2);
      vertices.push(new Vec3( x, y, z));
      if (i < numSides) {
        faces.push([ index + 1, index, centerIndex ])
      }
      normals.push(new Vec3(0, 1, 0));
      texCoords.push(new Vec2(1, 1));
      index++;
    }
  }

  this.computeEdges();
}

Cylinder.prototype = Object.create(Geometry.prototype);

module.exports = Cylinder;
