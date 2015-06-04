var VertexArray  = require('../glu/VertexArray');

function createFullScreenQuad(gl) {
  var va = new VertexArray(gl);
  va.addAttribute('position', [
    [-1, 1], [1, 1], [1,-1],
    [-1, 1], [1,-1], [-1,-1]
  ], { size: 2 });
  //NODE: for fbo this might need to be flipped
  va.addAttribute('texCoord', [
    [0, 1], [1, 1], [1, 0],
    [0, 1], [1, 0], [0, 0]
  ], { size: 2 });
  return va;
}

module.exports = createFullScreenQuad;
