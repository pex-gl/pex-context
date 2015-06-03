var VertexArray  = require('../glu/VertexArray');

function makeCube(gl) {
  var mesh = new VertexArray(gl);
  mesh.addAttribute('position', [
    [-1, -1,  1], [-1,  1,  1], [ 1,  1,  1], [ 1, -1,  1], //front face
    [-1, -1, -1], [-1,  1, -1], [ 1,  1, -1], [ 1, -1, -1], //back face
    [ 1, -1,  1], [ 1,  1,  1], [ 1,  1, -1], [ 1, -1, -1], //right face
    [-1, -1,  1], [-1,  1,  1], [-1,  1, -1], [-1, -1, -1], //left face
    [-1,  1,  1], [-1,  1, -1], [ 1,  1, -1], [ 1,  1,  1], //top face
    [-1, -1,  1], [-1, -1, -1], [ 1, -1, -1], [ 1, -1,  1]  //bottom face
  ], { size: 3 });
  mesh.addAttribute('normal', [
    [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], //front face
    [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], //back face
    [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], //right face
    [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], //left face
    [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], //top face
    [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0]  //bottom face
  ], { size: 3 });
  mesh.addIndexBuffer([
    [ 0,  3,  2], [ 0,  2,  1], //front face
    [ 6,  7,  4], [ 5,  6,  4], //back face
    [ 8, 11, 10], [ 8, 10,  9], //right face
    [14, 15, 12], [13, 14, 12], //left face
    [16, 19, 18], [16, 18, 17], //top face
    [22, 23, 20], [21, 22, 20]  //bottom face
  ]);
  return mesh;
}

module.exports = makeCube;
