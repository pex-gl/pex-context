var sys = require('pex-sys');
var geom = require('pex-geom');

var IO = sys.IO;
var Geometry = geom.Geometry;
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;

var MaxNumVertices = 64 * 1024;

var ObjReader = {};

ObjReader.load = function(file, callback) {
  IO.loadTextFile(file, function(text) {
    var geometry = ObjReader.parse(text);
    return callback(geometry);
  });
};

ObjReader.parse = function(text) {
  var lines = text.trim().split('\n');

  var geom = new Geometry({
    vertices: true,
    faces: true,
    normals: true,
    texCoords: true
  });

  lines.forEach(function(line, lineNumber) {
    var a, b, c, d, matches, u, v, x, y, z;
    matches = null;
    matches = line.match(/v\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      x = parseFloat(matches[1]);
      y = parseFloat(matches[2]);
      z = parseFloat(matches[3]);
      geom.vertices.push(new Vec3(x, y, z));
      return;
    }
    matches = line.match(/vt\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      u = parseFloat(matches[1]);
      v = parseFloat(matches[2]);
      geom.texCoords.push(new Vec2(u, v));
      return;
    }
    matches = line.match(/vn\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      x = parseFloat(matches[1]);
      y = parseFloat(matches[2]);
      z = parseFloat(matches[3]);
      geom.normals.push(new Vec3(x, y, z));
      return;
    }
    matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      var a = parseInt(matches[1]);
      var b = parseInt(matches[2]);
      var c = parseInt(matches[3]);
      var d = parseInt(matches[4]);
      if (a < 0) { a = geom.vertices.length + a; } else { a--; }
      if (b < 0) { b = geom.vertices.length + b; } else { b--; }
      if (c < 0) { c = geom.vertices.length + c; } else { c--; }
      if (d < 0) { d = geom.vertices.length + d; } else { d--; }
      geom.faces.push([a, b, c]);
      geom.faces.push([a, c, d]);
      return;
    }
    matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      var a = parseInt(matches[1]);
      var b = parseInt(matches[2]);
      var c = parseInt(matches[3]);
      if (a < 0) { a = geom.vertices.length + a; } else { a--; }
      if (b < 0) { b = geom.vertices.length + b; } else { b--; }
      if (c < 0) { c = geom.vertices.length + c; } else { c--; }
      if (a < MaxNumVertices && b < MaxNumVertices && c < MaxNumVertices) {
        geom.faces.push([a, b, c]);
      }
      else {
        throw 'Max number of vertices ' + MaxNumVertices + ' exceeded';
      }
      return;
    }
    if (ObjReader.verbose) {
      return console.log('ObjReader unknown line', line);
    }
  });
  if (geom.normals.length === 0) {
    delete geom.normals;
  }
  if (geom.texCoords.length === 0) {
    delete geom.texCoords;
  }
  if (ObjReader.verbose) {
    console.log("Vertices count " + geom.vertices.length);
  }
  if (ObjReader.verbose) {
    console.log("Vertices faces " + geom.faces.length);
  }
  return geom;
};

module.exports = ObjReader;
