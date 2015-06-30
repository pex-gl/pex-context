function createIcosahedron(r) {
    r = r || 0.5;

    var phi = (1 + Math.sqrt(5)) / 2;
    var a = r * 1 / 2;
    var b = r * 1 / (2 * phi);

    var positions = [
        [  0,  b, -a ],
        [  b,  a,  0 ],
        [ -b,  a,  0 ],
        [  0,  b,  a ],
        [  0, -b,  a ],
        [ -a,  0,  b ],
        [  a,  0,  b ],
        [  0, -b, -a ],
        [  a,  0, -b ],
        [ -a,  0, -b ],
        [  b, -a,  0 ],
        [ -b, -a,  0 ]
    ];

    var normals = positions.map(function(p) {
        var len = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
        return [ p[0] / len, p[1] / len, p[2] / len ];
    });

    var cells = [
      [  1,  0,  2 ],
      [  2,  3,  1 ],
      [  4,  3,  5 ],
      [  6,  3,  4 ],
      [  7,  0,  8 ],
      [  9,  0,  7 ],
      [ 10,  4, 11 ],
      [ 11,  7, 10 ],
      [  5,  2,  9 ],
      [  9, 11,  5 ],
      [  8,  1,  6 ],
      [  6, 10,  8 ],
      [  5,  3,  2 ],
      [  1,  3,  6 ],
      [  2,  0,  9 ],
      [  8,  0,  1 ],
      [  9,  7, 11 ],
      [ 10,  7,  8 ],
      [ 11,  4,  5 ],
      [  6,  4, 10 ]
    ];

    return {
        positions: positions,
        normals: normals,
        cells: cells
    }
}

module.exports = createIcosahedron;
