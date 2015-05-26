define(["pex/core/Core", "GeometryDecorator"], function(Core, GeometryDecorator) {
  function PoreDecorator(height, opennes) {
    this.height = height || 1;
    this.opennes = opennes || 0;
    console.log("this.opennes:"+this.opennes)
  }

  PoreDecorator.prototype = new GeometryDecorator();

  PoreDecorator.prototype.decorateFace = function(geometry, face) {
    var newVertices = [];
    var newFaces = [];
    var newEdges = [];
    var newTexCoords = [];
    if (face instanceof Core.Face4) {
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
      var sn = n.scaled(this.height);
      var center = a.dup().add(b).add(c).add(d).scale(1/4).add(sn);

      var sc = center.scaled(1.0 - this.opennes);
      var n1 = a.dup().add(b).scale(0.5).scale(this.opennes).add(sc).add(sn);
      var n2 = b.dup().add(c).scale(0.5).scale(this.opennes).add(sc).add(sn);
      var n3 = c.dup().add(d).scale(0.5).scale(this.opennes).add(sc).add(sn);
      var n4 = d.dup().add(a).scale(0.5).scale(this.opennes).add(sc).add(sn);

      newVertices.push(n1);
      newVertices.push(n2);
      newVertices.push(n3);
      newVertices.push(n4);

      newTexCoords.push(new Core.Vec2((ta.x + tb.x + tc.x + td.x)/4, (ta.y + tb.y + tc.y + td.y)/4));
      newTexCoords.push(new Core.Vec2((ta.x + tb.x + tc.x + td.x)/4, (ta.y + tb.y + tc.y + td.y)/4));
      newTexCoords.push(new Core.Vec2((ta.x + tb.x + tc.x + td.x)/4, (ta.y + tb.y + tc.y + td.y)/4));
      newTexCoords.push(new Core.Vec2((ta.x + tb.x + tc.x + td.x)/4, (ta.y + tb.y + tc.y + td.y)/4));

      newFaces.push(new Core.Face3(face.a, face.b, geometry.vertices.length));
      newFaces.push(new Core.Face3(face.b, face.c, geometry.vertices.length+1));
      newFaces.push(new Core.Face3(face.c, face.d, geometry.vertices.length+2));
      newFaces.push(new Core.Face3(face.d, face.a, geometry.vertices.length+3));

      newEdges.push(new Core.Edge(face.a, geometry.vertices.length));
      newEdges.push(new Core.Edge(face.b, geometry.vertices.length));

      newEdges.push(new Core.Edge(face.b, geometry.vertices.length+1));
      newEdges.push(new Core.Edge(face.c, geometry.vertices.length+1));

      newEdges.push(new Core.Edge(face.c, geometry.vertices.length+2));
      newEdges.push(new Core.Edge(face.d, geometry.vertices.length+2));

      newEdges.push(new Core.Edge(face.d, geometry.vertices.length+3));
      newEdges.push(new Core.Edge(face.a, geometry.vertices.length+3));
    }
    return {
      vertices: newVertices,
      faces: newFaces,
      edges: newEdges,
      texCoords : newTexCoords
    }
  }

  return PoreDecorator;
});
