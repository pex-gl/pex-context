define(["pex/core/Core"], function(Core) {
  function GeometryDecorator() {
  }

  GeometryDecorator.prototype.decorate = function(geometry) {
    if (!geometry.edges) {
      geometry.edges = [];
    }

    var decorations = [];
    for(var i=0; i<geometry.faces.length; i++) {
      var face = geometry.faces[i];
      var decoration = this.decorateFace(geometry, face);
      decorations.push(decoration);
    }

    var numVertices = geometry.vertices.length;
    var numAddedVertices = 0;
    for(var i=0; i<decorations.length; i++) {
      var decoration = decorations[i];

      for(var j=0; j<decoration.vertices.length; j++) {
        geometry.vertices.push(decoration.vertices[j]);
      }

      for(var j=0; j<decoration.texCoords.length; j++) {
        geometry.texCoords.push(decoration.texCoords[j]);
      }

      for(var j=0; j<decoration.faces.length; j++) {
        var face = decoration.faces[j];
        if (face.a >= numVertices) face.a += numAddedVertices;
        if (face.b >= numVertices) face.b += numAddedVertices;
        if (face.c >= numVertices) face.c += numAddedVertices;
        if (face.d && face.d >= numVertices) face.d += numAddedVertices;
        geometry.faces.push(face);
      }
      for(var j=0; j<decoration.edges.length; j++) {
        var edge = decoration.edges[j];
        if (edge.a >= numVertices) edge.a += numAddedVertices;
        if (edge.b >= numVertices) edge.b += numAddedVertices;
        geometry.edges.push(edge);
      }
      numAddedVertices += decoration.vertices.length;
    }
  }

  GeometryDecorator.prototype.decorateFace = function(geometry, face) {
    //empty method placeholder
    console.log("GeometryDecorator.decorateFace UNIMPLEMENTED")
  }

  return GeometryDecorator;
});
