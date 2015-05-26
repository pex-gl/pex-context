//Sphere geometry generator.

//## Parent class : [Geometry](../pex-geom/Geometry.html)

//## Example use
//      var g = new Sphere(1, 36, 36);
//      var mesh = new Mesh(g, new Materials.SolidColor());

var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Geometry = geom.Geometry;

//### Sphere ( r, nsides, nsegments )
//`r` - radius of the sphere *{ Number }*  
//`nsides` - number of subdivisions on XZ axis *{ Number }*  
//`nsegments` - number of subdivisions on Y axis *{ Number }*
function Sphere(r, nsides, nsegments) {
  r = r || 0.5;
  nsides = nsides || 36;
  nsegments = nsegments || 18;

  Geometry.call(this, { vertices: true, normals: true, texCoords: true, faces: true });

  var vertices = this.vertices;
  var texCoords = this.texCoords;
  var normals = this.normals;
  var faces = this.faces;

  var degToRad = 1/180.0 * Math.PI;

  var dphi   = 360.0/nsides;
  var dtheta = 180.0/nsegments;

  function evalPos(theta, phi) {
    var pos = new Vec3();
    pos.x = r * Math.sin(theta * degToRad) * Math.sin(phi * degToRad);
    pos.y = r * Math.cos(theta * degToRad);
    pos.z = r * Math.sin(theta * degToRad) * Math.cos(phi * degToRad);
    return pos;
  }

  for (var segment=0; segment<=nsegments; ++segment) {
    var theta = segment * dtheta;
    for (var side=0; side<=nsides; ++side) {
      var phi = side * dphi;
      var pos = evalPos(theta, phi);
      var normal = pos.dup().normalize();
      var texCoord = new Vec2(phi/360.0, theta/180.0);

      vertices.push(pos);
      normals.push(normal);
      texCoords.push(texCoord);

      if (segment == nsegments) continue;
      if (side == nsides) continue;

      if (segment == 0) {
        faces.push([
          (segment  )*(nsides+1) + side,
          (segment+1)*(nsides+1) + side,
          (segment+1)*(nsides+1) + side + 1
        ]);
      }
      else if (segment == nsegments - 1) {
        faces.push([
          (segment  )*(nsides+1) + side,
          (segment+1)*(nsides+1) + side + 1,
          (segment  )*(nsides+1) + side + 1
        ]);
      }
      else {
        faces.push([
          (segment  )*(nsides+1) + side,
          (segment+1)*(nsides+1) + side,
          (segment+1)*(nsides+1) + side + 1,
          (segment  )*(nsides+1) + side + 1
        ]);
      }
    }
  }

  this.computeEdges();
}

Sphere.prototype = Object.create(Geometry.prototype);

module.exports = Sphere;
