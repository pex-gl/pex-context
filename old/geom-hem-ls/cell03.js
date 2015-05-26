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

function HEEdge(hemesh, faceIndex, slot, label) {
  this.hemesh = hemesh;
  this.faceIndex = faceIndex;
  this.slot = slot;
  this.label = label;
}

function HEMesh() {
  this.vertices = [];
  this.edges = [];
  this.faces = [];
}

HEMesh.prototype.addFace = function(vertices, labels) {
  var face = new HEFace(this);
  face.vertexCount = vertices.length;
  var faceIndex = this.faces.length;
  for(var i=0; i<HE_MAX_VERT; i++) {
    if (i < vertices.length) {
      var label = labels ? labels[i] : "";
      face.vertices[i] = vertices[i];
      this.edges[faceIndex * HE_MAX_VERT + i] = new HEEdge(this, faceIndex, i, label);
    }
    else {
      face.vertices[i] = -1;
      this.edges[faceIndex * HE_MAX_VERT + i] = new HEEdge(this, faceIndex, -1, "");
    }
    face.opposite[i] = -1;
  }

  this.faces.push(face);
}

HEMesh.prototype.splitEdge = function(edge, ratio) {
  ratio = ratio || 0.5;
  
  var edgeFace = this.faces[edge.faceIndex];
  
  if (edgeFace.vertexCount == HE_MAX_VERT) {
    throw "Max number of vertices reached";
  }
  
  var nextEdge = this.edges[edge.faceIndex * HE_MAX_VERT + (edge.slot + 1) % edgeFace.vertexCount];;

  var newVertexPos = this.vertices[edgeFace.vertices[nextEdge.slot]].dup();
  newVertexPos.sub(this.vertices[edgeFace.vertices[edge.slot]]);
  newVertexPos.scale(ratio);
  newVertexPos.add(this.vertices[edgeFace.vertices[edge.slot]]);
  
  var newVertexIndex = this.vertices.length;
  this.vertices.push(newVertexPos);
  
  //add new point to the list
  edgeFace.vertexCount++;
  edgeFace.vertices.splice(edge.slot+1, 0, newVertexIndex);
  //remove additional extra point
  edgeFace.vertices.pop();

  this.edges.splice(edge.faceIndex * HE_MAX_VERT + HE_MAX_VERT, 1);  
  this.edges.splice(edge.faceIndex * HE_MAX_VERT + edge.slot + 1, 0, new HEEdge(this, edge.faceIndex, edge.slot + 1, edge.label));
}

HEMesh.prototype.splitFace = function(face, startSlot, endSlot) {
  var newVertices = new Array();
  
  for(var i=0; i<=startSlot; i++) {
    newVertices.push(face.vertices[i]);
  }
  for(var i=endSlot; i<face.vertexCount; i++) {
    newVertices.push(face.vertices[i]);
  }  
  for(var i=newVertices.length; i<HE_MAX_VERT; i++) {
    newVertices.push(-1);
  }
  
  var newFace = new HEFace(this);
  var newFaceVertices = [];
  
  for(var i=startSlot; i<=endSlot; i++) {
    newFaceVertices.push(face.vertices[i]);
  }
  
  this.addFace(newFaceVertices);
 
  face.vertices = newVertices;
  face.vertexCount = startSlot + face.vertexCount - endSlot + 1;  
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
    
    hemesh.splitEdge(hemesh.edges[2])
    hemesh.splitEdge(hemesh.edges[0])
    hemesh.splitFace(hemesh.faces[0], 1, 4, "C");

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
        var a = hemesh.vertices[face.vertices[i]];
        var b = hemesh.vertices[face.vertices[(i + 1) % face.vertexCount]];
        a = a.added(center.subbed(a).normalize().scale(5));
        b = b.added(center.subbed(b).normalize().scale(5));
        var middle = a.added(b).scaled(0.5);
        var dt = middle.added(center.subbed(middle).normalize().scale(10));
        if (dt.y < center.y) dt.y += 5;
        if (dt.x > center.x) dt.x -= 5;
        canvas.drawLine(paint, a.x, a.y, b.x, b.y);
        
        var label = hemesh.edges[faceIndex * 8 + i].label;
        paint.setFill();
        canvas.drawText(paint, label, dt.x, dt.y);
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