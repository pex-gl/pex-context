var VertexArray = require('./VertexArray');

//Geometry has to be simplical complex
function createVertexArrayFromGeometry(gl, geom) {
  var va = new VertexArray(gl);

  Object.keys(geom).forEach(function(attribName) {
    var attrib = geom[attribName];
    if (attribName == 'indices') {
      va.addIndexBuffer(attrib);
    }
    else {
      va.addAttribute(attribName, attrib)
    }
  })
  return va;
}

module.exports = createVertexArrayFromGeometry;
