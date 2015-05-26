//Catmull-Clark subdivision for half-edge meshes
//Based on http://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface
//Modified to follow Doo-Sabin scheme for new vertices 1/n*F + 1/n*R + (n-2)/n*v
//http://www.cse.ohio-state.edu/~tamaldey/course/784/note20.pdf
define([
  "hem/HEMesh",
  "hem/HEVertex",
  "hem/HEEdge",
  "hem/HEFace",

  "pex/core/Vec3"
  ],
  function(HEMesh, HEVertex, HEEdge, HEFace, Vec3) {
    
  function CatmullClark() {
  }

  HEMesh.prototype.subdivide = function() {
    this.clearMarking();
    //keep these numbers to iterate only over original faces/edges/vertices
    var numFaces = this.faces.length;
    var numEdges = this.edges.length;
    var numVertices = this.vertices.length;
    var i;

    //For each face, add a face point - the centroid of all original
    //points for the respective face
    for(i=0; i<numFaces; i++) {
      this.faces[i].facePoint = this.faces[i].getCenter();
    }

    //For each edge, add an edge point - the average of
    //the two neighbouring face points and its two original endpoints.
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.edgePoint != null) continue;
      var edgePoint = new Vec3(0, 0, 0);
      edgePoint.add(edge.vert);
      edgePoint.add(edge.next.vert);
      edgePoint.add(edge.face.facePoint);
      edgePoint.add(edge.pair.face.facePoint);
      edgePoint.scale(1/4);
      edge.edgePoint = edgePoint;
      edge.pair.edgePoint = edge.edgePoint;
    }

    for(i=0; i<numVertices; i++) {
      var vertex = this.vertices[i];
      var faceEdge = vertex.edge;
      var face = faceEdge.face;
      var F = new Vec3(0, 0, 0); //average facePoint of neighbor faces
      var R = new Vec3(0, 0, 0); //average edgePoint of neighbor edges
      var n = 0; //num faces/edges
      do {
        F.add(face.facePoint);
        R.add(faceEdge.edgePoint);
        ++n
        faceEdge = faceEdge.pair.next;
        face = faceEdge.face;
      } while(faceEdge != vertex.edge);
      F.scale(1/n);
      R.scale(1/n);

      var newVert = F.dup();
      newVert.add(R.scaled(1));
      newVert.add(vertex.scaled(n-2));
      newVert.scale(1/n);

      //we can't simply duplicate vertex and make operations on it
      //as dup() returns Vec3 not HEVertex
      vertex.x = newVert.x;
      vertex.y = newVert.y;
      vertex.z = newVert.z;
    }

    var numEdges = this.edges.length;
    for(i=0; i<numEdges; i++) {
      var edge = this.edges[i];
      if (edge.marked) continue;
      edge.marked = true;
      edge.pair.marked = true;
      var edgePoint = edge.edgePoint;
      delete edge.edgePoint;
      delete edge.pair.edgePoint;
      var newEdge = this.splitVertex(edge.vert, edgePoint, edge, edge);
      edge.edgePointVertex = newEdge.next.vert;
    }
    
    var selectedOnly = this.hasSelection();

    var numFaces = this.faces.length;
    for(i=0; i<numFaces; i++) {
      var face = this.faces[i];
      
      //if (selectedOnly && !face.selected) continue;
      
      var vert = face.edge.next.vert;
      var edge = face.edge.next;
      vert.edge = edge; //to make sure we split the right face
      var newEdge = this.splitVertex(vert, face.facePoint);

      var nextEdge = newEdge.next.next.next.next;
      do {
        var newFace = this.splitFace(newEdge.next, nextEdge);
        if (selectedOnly && face.selected) newFace.selected = true;
        nextEdge = nextEdge.next.next;
      } while (nextEdge != newEdge && nextEdge.next != newEdge);

      delete face.faceVertex;
    }

    this.clearMarking();

    return this;
  }

  return CatmullClark;
});
