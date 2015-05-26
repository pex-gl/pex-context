var plask = require("plask");

var Vec3 = plask.Vec3;

var HE_MAX_VERT = 8;

function HEFace(hemesh) {
  this.hemesh = hemesh;
  this.vertexCount = 0;
  this.vertices = new Array(HE_MAX_VERT);
  this.opposite = new Array(HE_MAX_VERT);
  this.labels = new Array(HE_MAX_VERT);
}

HEFace.prototype.getCenter = function() {
  var center = new Vec3(0, 0, 0);
  for(var i=0; i<this.vertexCount; i++) {
    center.add(this.hemesh.vertices[this.vertices[i]]);
  }
  center.scale(1 / this.vertexCount);
  return center;
}

function HEEdge(hemesh, faceIndex, slot) {
  this.hemesh = hemesh;
  this.faceIndex = faceIndex;
  this.slot = slot;
}

function HEMesh() {
  this.vertices = [];
  this.faces = [];
}

HEMesh.prototype.addFace = function(vertices, labels) {
  var face = new HEFace(this);
  face.vertexCount = vertices.length;
  var faceIndex = this.faces.length;
  for(var i=0; i<HE_MAX_VERT; i++) {
    if (i < vertices.length) {
      face.vertices[i] = vertices[i];
      if (labels) {
        face.labels[i] = labels[i];
      }
    }
    else {
      face.vertices[i] = -1;
      face.labels[i] = "";
    }
    face.opposite[i] = null;
  }

  this.faces.push(face);
}

HEMesh.prototype.splitEdge = function(face, slot, ratio) {
  ratio = ratio || 0.5;
  
  var newVertexPos = this.vertices[face.vertices[(slot + 1) % face.vertexCount]].dup();
  newVertexPos.sub(this.vertices[face.vertices[slot]]);
  newVertexPos.scale(ratio);
  newVertexPos.add(this.vertices[face.vertices[slot]]);
  
  var newVertexIndex = this.vertices.length;
  this.vertices.push(newVertexPos);
  
  face.vertexCount++;
  face.vertices.splice(slot + 1, 0, newVertexIndex);
  face.labels.splice(slot + 1, 0, face.labels[slot]);  
}

HEMesh.prototype.splitFace = function(face, startSlot, endSlot, label) {
  var newVertices = new Array();
  var newLabels = new Array();
  
  for(var i=0; i<=startSlot; i++) {
    newVertices.push(face.vertices[i]);
    newLabels.push(face.labels[i]);
  }
  
  newLabels[newLabels.length - 1] = label;
  
  for(var i=endSlot; i<face.vertexCount; i++) {
    newVertices.push(face.vertices[i]);
    newLabels.push(face.labels[i]);
  }  
  
  for(var i=newVertices.length; i<HE_MAX_VERT; i++) {
    newVertices.push(-1);
    newLabels.push("");
  }
  
  var newFace = new HEFace(this);
  var newFaceVertices = [];
  var newFaceLabels = [];
  
  for(var i=startSlot; i<=endSlot; i++) {
    newFaceVertices.push(face.vertices[i]);
    newFaceLabels.push(face.labels[i]);
  }
  
  newFaceLabels[newFaceLabels.length-1] = label;
  
  this.addFace(newFaceVertices, newFaceLabels);
 
  face.vertices = newVertices;
  face.labels = newLabels;
  face.vertexCount = startSlot + face.vertexCount - endSlot + 1;  
}

HEMesh.prototype.rebuidOpposite = function() {
  var edges = [];
  for(var faceIndex=0; faceIndex<this.faces.length; faceIndex++) {
    var face = this.faces[faceIndex];    
    for(var slot=0; slot<face.vertexCount; slot++) {      
      face.opposite[slot] = null;
      var a = face.vertices[slot];
      var b = face.vertices[(slot+1) % face.vertexCount];
      edges.push([
        Math.min(a, b),
        Math.max(a, b),
        faceIndex,
        slot
      ]);
    }
  }
  
  edges.sort(function(a, b) {
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    if (a[1] > b[1]) return 1;
    if (a[1] < b[1]) return -1;
    return 0;
  })
  
  for(var i=0; i<edges.length-1; i++) {    
    if (edges[i][0] == edges[i+1][0] && edges[i][1] == edges[i+1][1]) {
      this.faces[edges[i][2]].opposite[edges[i][3]] = edges[i+1];
      this.faces[edges[i+1][2]].opposite[edges[i+1][3]] = edges[i];      
    }
  }  
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
      new Vec3(w * 0.7, h*0.3, 0),
      new Vec3(w * 0.7, h*0.7, 0),
      new Vec3(w * 0.3, h*0.7, 0)
    ];

    hemesh.addFace([0, 1, 2, 3], ["A", "B", "A", "B"]);
    
    hemesh.splitEdge(hemesh.faces[0], 2);
    hemesh.splitEdge(hemesh.faces[0], 0);
    hemesh.splitFace(hemesh.faces[0], 1, 4, "C");
    hemesh.rebuidOpposite();

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
    
    paint.setFlags(paint.kAntiAliasFlag);

    function drawVertex(v) {
      paint.setFill();
      paint.setColor(255, 0, 0, 255);
      canvas.drawCircle(paint, v.x, v.y, 3);
    }

    function drawFace(face) {
      paint.setStroke();
      paint.setFill(255, 0, 0, 255);

      var center = face.getCenter();
      var faceIndex = hemesh.faces.indexOf(face);

      for(var i=0; i<face.vertexCount; i++) {
        if (face.opposite[i]) {
            paint.setColor(0, 255, 0, 255);
        }
        else {
            paint.setColor(255, 0, 0, 255);
        }
        var a = hemesh.vertices[face.vertices[i]];
        var b = hemesh.vertices[face.vertices[(i + 1) % face.vertexCount]];
        a = a.added(center.subbed(a).normalize().scale(5));
        b = b.added(center.subbed(b).normalize().scale(5));
        var middle = a.added(b).scaled(0.5);
        var dt = middle.added(center.subbed(middle).normalize().scale(10));
        if (dt.y < center.y) dt.y += 5;
        if (dt.x > center.x) dt.x -= 5;
        canvas.drawLine(paint, a.x, a.y, b.x, b.y);
        
        paint.setFill();
        canvas.drawText(paint, face.labels[i], dt.x, dt.y);
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