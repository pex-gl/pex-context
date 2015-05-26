var plask = require("plask");

var Vec3 = plask.Vec3;

var HE_MAX_VERT = 8;

function HEFace(hemesh) {
  this.hemesh = hemesh;
  this.vertexCount = 0;
  this.vertices = new Array(HE_MAX_VERT);
  this.opposite = new Array(HE_MAX_VERT);
}

HEFace.prototype.getCenter = function() {
  var center = new Vec3(0, 0, 0);
  for(var i=0; i<this.vertexCount; i++) {
    center.add(this.hemesh.vertices[this.vertices[i]]);
  }
  center.scale(1 / this.vertexCount);
  return center;
}

function HEMesh() {
  this.vertices = [];
  this.edges = [];
  this.faces = [];
}

HEMesh.prototype.addFace = function(vertices) {
  var face = new HEFace(this);
  face.vertexCount = vertices.length;
  var faceIndex = this.faces.length;
  for(var i=0; i<HE_MAX_VERT; i++) {
    if (i < vertices.length) {
      face.vertices[i] = vertices[i];
      this.edges[faceIndex * HE_MAX_VERT + i] = [faceIndex, i];
    }
    else {
      face.vertices[i] = -1;
      this.edges[faceIndex * HE_MAX_VERT + i] = [faceIndex, -1];
    }
    face.opposite[i] = -1;
  }

  this.faces.push(face);
}

plask.simpleWindow({
  settings : {
    width: 1280,
    height: 720,
    type: '2d'
  },
  init: function() {
    var w = this.width;
    var h = this.height;

    var hemesh = new HEMesh();

    hemesh.vertices = [
      new Vec3(w * 0.3, h*0.3, 0),
      new Vec3(w * 0.5, h*0.3, 0),
      new Vec3(w * 0.7, h*0.3, 0),
      new Vec3(w * 0.7, h*0.7, 0),
      new Vec3(w * 0.5, h*0.7, 0),
      new Vec3(w * 0.3, h*0.7, 0)
    ];

    hemesh.addFace([0, 1, 4, 5]);
    hemesh.addFace([1, 2, 3, 4]);

    this.hemesh = hemesh;

    this.rules = [
      ["A", "B[-A][+A]B"],
      ["B", "A"]
    ];

    this.iterate();
  },
  iterate: function() {

  },
  draw: function() {
    var canvas = this.canvas;
    var paint = this.paint;
    var hemesh = this.hemesh;

    canvas.clear(255, 255, 255, 255);

    function drawVertex(v) {
      paint.setFill();
      paint.setColor(255, 0, 0, 255);
      canvas.drawCircle(paint, v.x, v.y, 3);
    }

    function drawFace(face) {
      paint.setStroke();
      paint.setFill(255, 0, 0, 255);

      var center = face.getCenter();

      for(var i=0; i<face.vertexCount; i++) {
        var a = hemesh.vertices[face.vertices[i]];
        var b = hemesh.vertices[face.vertices[(i + 1) % face.vertexCount]];
        a = a.added(center.subbed(a).normalize().scale(5));
        b = b.added(center.subbed(b).normalize().scale(5));
        canvas.drawLine(paint, a.x, a.y, b.x, b.y);
      }
    }

    function drawMarker(m) {
      paint.setStroke();
      paint.setFill(255, 0, 0, 255);
      var a = m[0];
      var b = m[1];
      var label = m[2];
      canvas.drawLine(paint, a[0], a[1], b[0], b[1])
      paint.setFill();
      canvas.drawText(paint, label, (a[0] + b[0])/2 + 5, (a[1] + b[1])/2 - 5);
    }

    hemesh.vertices.forEach(drawVertex);
    hemesh.faces.forEach(drawFace);
  }
});