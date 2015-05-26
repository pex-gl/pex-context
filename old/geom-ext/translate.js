function translate(g, offset) {
  var vertices = g.vertices;
  var numVertices = g.vertices.length;
  for(var i=0; i<numVertices; i++) {
    vertices[i].x += offset.x;
    vertices[i].y += offset.y;
    vertices[i].z += offset.z;
  }
}

module.exports = translate;