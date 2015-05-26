define(["pex/core/Vec3"], function(Vec3) {
  function HEFace(edge) {
    this.edge = edge;
    this.selected = 0;
  }

  HEFace.prototype.getNormal = function() {
    var a = this.edge.vert;
    var b = this.edge.next.vert;
    var c = this.edge.next.next.vert;
    var ab = b.subbed(a);
    var bc = c.subbed(b);
    var n = ab.crossed(bc);
    n.normalize();
    return n;
  }

  //calculates the centroid of the face
  HEFace.prototype.getCenter = function() {
    var vertexCount = 0;
    var center = new Vec3(0, 0, 0);
    var edge = this.edge;
    do {
      center.add(edge.vert);
      vertexCount++;
      edge = edge.next;
    } while (edge != this.edge);

    center.scale(1/vertexCount);
    return center;
  }

  HEFace.prototype.getNeighborFaces = function() {
    var neighbors = [];
    this.edgePairLoop(function(edge) {
      neighbors.push(edge.pair.face);
    });
    return neighbors;
  }

  HEFace.prototype.getAllVertices = function() {
    var vertices = [];
    var edge = this.edge;
    do {
      vertices.push(edge.vert);
      edge = edge.next;
    } while (edge != this.edge);
    return vertices;
  }
  
  HEFace.prototype.edgePairLoop = function(callback) {
    var edge = this.edge;
    do {
      callback(edge, edge.next);
      edge = edge.next;
    } while(edge != this.edge);
    
  }

  return HEFace;
});
