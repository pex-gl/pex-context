//Returns a simplical complex cube mesh
function createCube(sx, sy, sz) {
  sx = sx || 1;
  sy = sy || sx || 1;
  sz = sz || sy || sx || 1;
  return {
    position: [
      [-sx/2, -sy/2,  sz/2], [-sx/2,  sy/2,  sz/2], [ sx/2,  sy/2,  sz/2], [ sx/2, -sy/2,  sz/2], //front face
      [-sx/2, -sy/2, -sz/2], [-sx/2,  sy/2, -sz/2], [ sx/2,  sy/2, -sz/2], [ sx/2, -sy/2, -sz/2], //back face
      [ sx/2, -sy/2,  sz/2], [ sx/2,  sy/2,  sz/2], [ sx/2,  sy/2, -sz/2], [ sx/2, -sy/2, -sz/2], //right face
      [-sx/2, -sy/2,  sz/2], [-sx/2,  sy/2,  sz/2], [-sx/2,  sy/2, -sz/2], [-sx/2, -sy/2, -sz/2], //left face
      [-sx/2,  sy/2,  sz/2], [-sx/2,  sy/2, -sz/2], [ sx/2,  sy/2, -sz/2], [ sx/2,  sy/2,  sz/2], //top face
      [-sx/2, -sy/2,  sz/2], [-sx/2, -sy/2, -sz/2], [ sx/2, -sy/2, -sz/2], [ sx/2, -sy/2,  sz/2]  //bottom face
    ],
    normal: [
      [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], [ 0,  0,  1], //front face
      [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], [ 0,  0, -1], //back face
      [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], //right face
      [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], [-1,  0,  0], //left face
      [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], [ 0,  1,  0], //top face
      [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0], [ 0, -1,  0]  //bottom face
    ],
    indices: [
      [ 0,  3,  2], [ 0,  2,  1], //front face
      [ 6,  7,  4], [ 5,  6,  4], //back face
      [ 8, 11, 10], [ 8, 10,  9], //right face
      [14, 15, 12], [13, 14, 12], //left face
      [16, 19, 18], [16, 18, 17], //top face
      [22, 23, 20], [21, 22, 20]  //bottom face
    ]
  }
}

module.exports = createCube;
