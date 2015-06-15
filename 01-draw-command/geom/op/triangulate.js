//similar packages
//https://github.com/hughsk/unindex-mesh

var clone = require('clone');
//naive face triangulation - builds a triangle fan anchored at the first face vertex
function triangulate(positions, faces) {
  return {
    position: clone(positions),
    indices: triangulateFaces(faces)
  }
}

function triangulateFaces(faces) {
  var triangles = [];
  for(var i=0; i<faces.length; i++) {
    var face = faces[i];
    triangles.push([face[0], face[1], face[2]]);
    for(var j=2; j<face.length-1; j++) {
      triangles.push([face[0],face[j],face[j+1]]);
    }
  }
  return triangles;
}

module.exports = triangulate;
module.exports.faces = triangulateFaces;
