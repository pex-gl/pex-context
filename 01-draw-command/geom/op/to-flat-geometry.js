var clone = require('clone');

function toFlatGeometry(vertices, faces) {
  var newVertices = [];
  var newFaces = [];

  for(var i=0; i<faces.length; i++) {
    var face = faces[i];
    var newFace = [];
    for(var j=0; j<face.length; j++) {
      newFace.push(newVertices.length);
      newVertices.push(clone(vertices[face[j]]))
    }
    newFaces.push(newFace);
  }

  return {
    position: newVertices,
    indices: newFaces
  }
}

module.exports = toFlatGeometry;
