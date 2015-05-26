//Loft geometry generator.  
//Extruded 2d shape along a 3d curve.  

//## Parent class : [geom.Geometry](../pex-geom/Geometry.html)

//## Example use
//      var spline = new geom.Spline3D([
//        { x: -1.0, y: 0.0, z: 0.0 },
//        { x:  0.0, y: 0.5, z: 0.0 },
//        { x:  1.0, y: 0.0, z: 0.0 },
//      ]);
//
//      var shapePath = new geom.Path([
//        new Vec3(-0.1, -0.4, 0),
//        new Vec3( 0.1, -0.4, 0),
//        new Vec3( 0.1,  0.4, 0),
//        new Vec3(-0.1,  0.4, 0)
//      ]);
//
//      var g = new Loft(spline1, {
//        shapePath: shapePath,
//        caps: true,
//        numSteps: 10,
//        numSegments: 4
//      });
//
//      var mesh = new Mesh(g, new materials.SolidColor());


// ## Version history
// 1. Naive implementation
// https://gist.github.com/roxlu/2859605
// 2. Fixed twists
// http://www.lab4games.net/zz85/blog/2012/04/24/spline-extrusions-tubes-and-knots-of-sorts/
// http://www.cs.cmu.edu/afs/andrew/scs/cs/15-462/web/old/asst2camera.html

var merge = require('merge');
var geom = require('pex-geom');
var Geometry = geom.Geometry;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Mat4 = geom.Mat4;
var Quat = geom.Quat;
var Path = geom.Path;
var Spline1D = geom.Spline1D;
var Spline3D = geom.Spline3D;
var acos = Math.acos;
var PI = Math.PI;
var min = Math.min;
var LineBuilder = require('./LineBuilder');

var EPSILON = 0.00001;

//### Loft ( path, options)  
//`path` - path along which we will extrude the shape *{ Path/Spline = required }*  
//`options` - available options *{ Object }*  
// - `numSteps` - number of extrusion steps along the path *{ Number/Int = 200 }*  
// - `numSegments` - number of sides of the extruded shape *{ Number/Int = 8 }*  
// - `r` - radius scale of the extruded shape *{ Number = 1 }*  
// - `shapePath` - shape to be extruded, if none a circle will be generated *{ Path = null }*  
// - `xShapeScale` - distorion scale along extruded shape x axis *{ Number = 1 }*  
// - `caps` - generate ending caps geometry *{ bool = false }*  
// - `initialNormal` - starting frame normal *{ Vec3 = null }*  
function Loft(path, options) {
  options = options || {};
  Geometry.call(this, { vertices: true, normals: true, texCoords: true, edges: false, faces: true });
  var defaults = {
    numSteps: 200,
    numSegments: 8,
    r: 1,
    shapePath: null,
    xShapeScale: 1,
    caps: false,
    initialNormal: null
  };
  path.samplesCount = 5000;
  if (options.shapePath && !options.numSegments) {
    options.numSegments = options.shapePath.points.length;
  }
  this.options = options = merge(defaults, options);
  this.path = path;
  if (path.isClosed()) options.caps = false;
  this.shapePath = options.shapePath || this.makeShapePath(options.numSegments);
  this.rfunc = this.makeRadiusFunction(options.r);
  this.rufunc = options.ru ? this.makeRadiusFunction(options.ru) : this.rfunc;
  this.rvfunc = options.rv ? this.makeRadiusFunction(options.rv) : (options.ru ? this.rufunc : this.rfunc);
  this.points = this.samplePoints(path, options.numSteps, path.isClosed());
  this.tangents = this.sampleTangents(path, options.numSteps, path.isClosed());
  this.frames = this.makeFrames(this.points, this.tangents, path.isClosed());
  this.buildGeometry(options.caps);
}

Loft.prototype = Object.create(Geometry.prototype);

Loft.prototype.buildGeometry = function(caps) {
  caps = typeof caps !== 'undefined' ? caps : false;

  var index = 0;
  var numSteps = this.options.numSteps;
  var numSegments = this.options.numSegments;

  for (var i=0; i<this.frames.length; i++) {
    var frame = this.frames[i];
    var ru = this.rufunc(i, numSteps);
    var rv = this.rvfunc(i, numSteps);
    for (var j=0; j<numSegments; j++) {
      if (numSegments == this.shapePath.points.length) {
        p = this.shapePath.getPoint(j / (numSegments-1));
      }
      else {
        p = this.shapePath.getPointAt(j / (numSegments-1));
      }
      p.x *= ru;
      p.y *= rv;
      p = p.transformMat4(frame.m).add(frame.position);
      this.vertices.push(p);
      this.texCoords.push(new Vec2(j / numSegments, i / numSteps));
      this.normals.push(p.dup().sub(frame.position).normalize());
    }
  }

  if (caps) {
    this.vertices.push(this.frames[0].position);
    this.texCoords.push(new Vec2(0, 0));
    this.normals.push(this.frames[0].tangent.dup().scale(-1));
    this.vertices.push(this.frames[this.frames.length - 1].position);
    this.texCoords.push(new Vec2(0, 0));
    this.normals.push(this.frames[this.frames.length - 1].tangent.dup().scale(-1));
  }

  index = 0;
  for (var i=0; i<this.frames.length; i++) {
    for (var j=0; j<numSegments; j++) {
      if (i < numSteps - 1) {
        this.faces.push([index + (j + 1) % numSegments + numSegments, index + (j + 1) % numSegments, index + j, index + j + numSegments ]);
      }
    }
    index += numSegments;
  }
  if (this.path.isClosed()) {
    index -= numSegments;
    for (var j=0; j<numSegments; j++) {
      this.faces.push([(j + 1) % numSegments, index + (j + 1) % numSegments, index + j, j]);
    }
  }
  if (caps) {
    for (var j=0; j<numSegments; j++) {
      this.faces.push([j, (j + 1) % numSegments, this.vertices.length - 2]);
      this.faces.push([this.vertices.length - 1, index - numSegments + (j + 1) % numSegments, index - numSegments + j]);
    }
  }
};

Loft.prototype.makeShapePath = function(numSegments) {
  var shapePath = new Path();
  for (var i=0; i<numSegments; i++) {
    var t = i / numSegments;
    var a = t * 2 * Math.PI;
    var p = new Vec3(Math.cos(a), Math.sin(a), 0);
    shapePath.addPoint(p);
  }
  shapePath.close();
  return shapePath;
};

Loft.prototype.makeFrames = function(points, tangents, closed, rot) {
  if (rot == null) {
    rot = 0;
  }
  var tangent = tangents[0];
  var atx = Math.abs(tangent.x);
  var aty = Math.abs(tangent.y);
  var atz = Math.abs(tangent.z);
  var v = null;
  if (atz > atx && atz >= aty) {
    v = tangent.dup().cross(new Vec3(0, 1, 0));
  }
  else if (aty > atx && aty >= atz) {
    v = tangent.dup().cross(new Vec3(1, 0, 0));
  }
  else {
    v = tangent.dup().cross(new Vec3(0, 0, 1));
  }
  var normal = this.options.initialNormal || Vec3.create().asCross(tangent, v).normalize();
  var binormal = Vec3.create().asCross(tangent, normal).normalize();
  var prevBinormal = null;
  var prevNormal = null;
  var frames = [];
  var rotation = new Quat();
  v = new Vec3();
  for (var i = 0; i<this.points.length; i++) {
    var position = points[i];
    tangent = tangents[i];
    if (i > 0) {
      normal = normal.dup();
      binormal = binormal.dup();
      prevTangent = tangents[i - 1];
      v.asCross(prevTangent, tangent);
      if (v.length() > EPSILON) {
        v.normalize();
        theta = acos(prevTangent.dot(tangent));
        rotation.setAxisAngle(v, theta * 180 / PI);
        normal.transformQuat(rotation);
      }
      binormal.asCross(tangent, normal);
    }
    var m = new Mat4().set4x4r(binormal.x, normal.x, tangent.x, 0, binormal.y, normal.y, tangent.y, 0, binormal.z, normal.z, tangent.z, 0, 0, 0, 0, 1);
    frames.push({
      tangent: tangent,
      normal: normal,
      binormal: binormal,
      position: position,
      m: m
    });
  }
  if (closed) {
    firstNormal = frames[0].normal;
    lastNormal = frames[frames.length - 1].normal;
    theta = Math.acos(clamp(firstNormal.dot(lastNormal), 0, 1));
    theta /= frames.length - 1;
    if (tangents[0].dot(v.asCross(firstNormal, lastNormal)) > 0) {
      theta = -theta;
    }
    frames.forEach(function(frame, frameIndex) {
      rotation.setAxisAngle(frame.tangent, theta * frameIndex * 180 / PI);
      frame.normal.transformQuat(rotation);
      frame.binormal.asCross(frame.tangent, frame.normal);
      frame.m.set4x4r(frame.binormal.x, frame.normal.x, frame.tangent.x, 0, frame.binormal.y, frame.normal.y, frame.tangent.y, 0, frame.binormal.z, frame.normal.z, frame.tangent.z, 0, 0, 0, 0, 1);
    });
  }
  return frames;
};

Loft.prototype.samplePoints = function(path, numSteps, closed) {
  var points = [];
  var N = closed ? numSteps : (numSteps - 1);
  for(var i=0; i<numSteps; i++) {
    points.push(path.getPointAt(i / N));
  }
  return points;
};

Loft.prototype.sampleTangents = function(path, numSteps, closed) {
  var points = [];
  var N = closed ? numSteps : (numSteps - 1);
  for(var i=0; i<numSteps; i++) {
    points.push(path.getTangentAt(i / N));
  }
  return points;
};

Loft.prototype.makeRadiusFunction = function(r) {
  var rfunc;
  if (r instanceof Spline1D) {
    return rfunc = function(t, n) {
      return r.getPointAt(t / (n - 1));
    };
  }
  else {
    return rfunc = function(t) {
      return r;
    };
  }
};

Loft.prototype.toDebugLines = function(lineLength) {
  lineLength = lineLength || 0.5
  var lineBuilder = new LineBuilder();
  var red = { r: 1, g: 0, b: 0, a: 1};
  var green = { r: 0, g: 1, b: 0, a: 1};
  var blue = { r: 0, g: 0.5, b: 1, a: 1};
  this.frames.forEach(function(frame, frameIndex) {
    lineBuilder.addLine(frame.position, frame.position.dup().add(frame.tangent.dup().scale(lineLength)), red, red);
    lineBuilder.addLine(frame.position, frame.position.dup().add(frame.normal.dup().scale(lineLength)), green, green);
    lineBuilder.addLine(frame.position, frame.position.dup().add(frame.binormal.dup().scale(lineLength)), blue, blue);
  });
  return lineBuilder;
}

//## Utility functions

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

module.exports = Loft;
