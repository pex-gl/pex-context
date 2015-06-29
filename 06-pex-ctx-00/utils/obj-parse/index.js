function parseObj(text) {
  var lines = text.trim().split('\n');

  var geom = {
    positions: [],
    cells: [],
    normals: [],
    uvs: []
  };

  lines.forEach(function(line, lineNumber) {
    var a, b, c, d, matches, u, v, x, y, z;
    matches = null;
    matches = line.match(/v\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      x = parseFloat(matches[1]);
      y = parseFloat(matches[2]);
      z = parseFloat(matches[3]);
      geom.positions.push([x, y, z]);
      return;
    }
    matches = line.match(/vt\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      u = parseFloat(matches[1]);
      v = parseFloat(matches[2]);
      geom.uvs.push([u, v]);
      return;
    }
    matches = line.match(/vn\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      x = parseFloat(matches[1]);
      y = parseFloat(matches[2]);
      z = parseFloat(matches[3]);
      geom.normals.push([x, y, z]);
      return;
    }
    matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      var a = parseInt(matches[1]);
      var b = parseInt(matches[2]);
      var c = parseInt(matches[3]);
      var d = parseInt(matches[4]);
      if (a < 0) { a = geom.positions.length + a; } else { a--; }
      if (b < 0) { b = geom.positions.length + b; } else { b--; }
      if (c < 0) { c = geom.positions.length + c; } else { c--; }
      if (d < 0) { d = geom.positions.length + d; } else { d--; }
      geom.cells.push([a, b, c]);
      geom.cells.push([a, c, d]);
      return;
    }
    matches = line.match(/f\s+([^\s]+)\s+([^\s]+)\s+([^\s]+)/);
    if (matches !== null) {
      var a = parseInt(matches[1]);
      var b = parseInt(matches[2]);
      var c = parseInt(matches[3]);
      if (a < 0) { a = geom.positions.length + a; } else { a--; }
      if (b < 0) { b = geom.positions.length + b; } else { b--; }
      if (c < 0) { c = geom.positions.length + c; } else { c--; }
      geom.cells.push([a, b, c]);
      return;
    }
  });
  if (geom.normals.length === 0) {
    delete geom.normals;
  }
  if (geom.uvs.length === 0) {
    delete geom.uvs;
  }
  return geom;
};

module.exports = parseObj;
