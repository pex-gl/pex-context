//Returns a simplical complex cube mesh
//     4----7
//    /:   /|
//   5----6 |
//   | 0..|.3
//   |,   |/
//   1----2
function createBox(sx, sy, sz) {
  sx = sx || 1;
  sy = sy || sx || 1;
  sz = sz || sy || sx || 1;
  var x = sx/2;
  var y = sy/2;
  var z = sz/2;
  return {
    position: [
      //bottom
      [-x, -y, -z],
      [-x, -y,  z],
      [ x, -y,  z],
      [ x, -y, -z],
      //top
      [-x,  y, -z],
      [-x,  y,  z],
      [ x,  y,  z],
      [ x,  y, -z]
    ],
    indices: [
      [0, 3, 2, 1], //bottom
      [4, 5, 6, 7], //top
      [0, 1, 5, 4], //left
      [2, 3, 7, 6], //right
      [1, 2, 6, 5], //front
      [3, 0, 4, 7]  //back
    ]
  }
}

module.exports = createBox;
