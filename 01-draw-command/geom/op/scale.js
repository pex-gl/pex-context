//similar packages
//http://stack.gl/packages/#thibauts/rescale-vertices

var clone = require('clone');

function scale(vertices, faces, scale) {
  return {
    position: vertices.map(function(v) {
      return v.map(function(val) {
        return val * scale;
      })
    }),
    indices: clone(faces)
  }
}

module.exports = scale;
