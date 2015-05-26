define(["pex/core/Core", "GeometryDecorator"], function(Core, GeometryDecorator) {
  function PoreDecorator(height) {
    this.height = height || 1;
  }

  PoreDecorator.prototype = new GeometryDecorator();

  PoreDecorator.prototype.decorateFace = function(geometry, face) {
    var newVertices = [];
    var newFaces = [];
    var newEdges = [];
    var newTexCoords = [];
    if (face instanceof Core.Face4) {
      var h = this.height;
      var a = geometry.vertices[face.a];
      var b = geometry.vertices[face.b];
      var c = geometry.vertices[face.c];
      var d = geometry.vertices[face.d];
      var ta = geometry.texCoords[face.a];
      var tb = geometry.texCoords[face.b];
      var tc = geometry.texCoords[face.c];
      var td = geometry.texCoords[face.d];
      var na = geometry.normals[face.a];
      var nb = geometry.normals[face.b];
      var nc = geometry.normals[face.c];
      var n = na.added(nb).added(nc).scaled(1/3);
      var h = a.subbed(c).length() * 0.3;
      var a2 = a.scaled(0.7).add(c.scaled(0.3)).add(n.scaled(h));
      var b2 = b.scaled(0.7).add(d.scaled(0.3)).add(n.scaled(h));
      var c2 = c.scaled(0.7).add(a.scaled(0.3)).add(n.scaled(h));
      var d2 = d.scaled(0.7).add(b.scaled(0.3)).add(n.scaled(h));

      //newTexCoords.push(new Core.Vec2(ta.x*0.4 + tb.x*0.3 + tc.x*0.3 + td.x*0.4, ta.y*0.4 + tb.y*0.4 + tc.y*0.3 + td.y*0.3));
      //newTexCoords.push(new Core.Vec2(ta.x*0.4 + tb.x*0.4 + tc.x*0.3 + td.x*0.3, ta.y*0.3 + tb.y*0.4 + tc.y*0.4 + td.y*0.3));
      //newTexCoords.push(new Core.Vec2(ta.x*0.3 + tb.x*0.3 + tc.x*0.4 + td.x*0.3, ta.y*0.3 + tb.y*0.3 + tc.y*0.4 + td.y*0.4));
      //newTexCoords.push(new Core.Vec2(ta.x*0.4 + tb.x*0.3 + tc.x*0.3 + td.x*0.4, ta.y*0.3 + tb.y*0.3 + tc.y*0.4 + td.y*0.4));
      //newTexCoords.push(new Core.Vec2(0, 0));
      //newTexCoords.push(new Core.Vec2(0, 0));
      //newTexCoords.push(new Core.Vec2(0, 0));
      //newTexCoords.push(new Core.Vec2(0, 0));

      newVertices.push(a2);
      newVertices.push(b2);
      newVertices.push(c2);
      newVertices.push(d2);

      newFaces.push(new Core.Face4(face.a, face.b, geometry.vertices.length + 1, geometry.vertices.length + 0));
      newFaces.push(new Core.Face4(face.b, face.c, geometry.vertices.length + 2, geometry.vertices.length + 1));
      newFaces.push(new Core.Face4(face.c, face.d, geometry.vertices.length + 3, geometry.vertices.length + 2));
      newFaces.push(new Core.Face4(face.d, face.a, geometry.vertices.length + 0, geometry.vertices.length + 3));

      newEdges.push(new Core.Edge(face.a, geometry.vertices.length));
      newEdges.push(new Core.Edge(face.b, geometry.vertices.length + 1));
      newEdges.push(new Core.Edge(face.c, geometry.vertices.length + 2));
      newEdges.push(new Core.Edge(face.d, geometry.vertices.length + 3));

      newEdges.push(new Core.Edge(geometry.vertices.length + 0, geometry.vertices.length + 0));
      newEdges.push(new Core.Edge(geometry.vertices.length + 1, geometry.vertices.length + 2));
      newEdges.push(new Core.Edge(geometry.vertices.length + 2, geometry.vertices.length + 3));
      newEdges.push(new Core.Edge(geometry.vertices.length + 3, geometry.vertices.length + 0));

      newEdges.push(new Core.Edge(face.a, face.b));
      newEdges.push(new Core.Edge(face.b, face.c));
      newEdges.push(new Core.Edge(face.c, face.d));
      newEdges.push(new Core.Edge(face.d, face.a));


    }
    return {
      vertices: newVertices,
      faces: newFaces,
      edges: newEdges,
      texCoords: newTexCoords
    }
  }

  return PoreDecorator;
});
