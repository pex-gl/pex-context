var add = require('gl-vec3/add');
var scale = require('gl-vec3/scale');

function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return add(center, center, p);
  }, [0, 0, 0]);
  scale(center, center, 1 / points.length);
  return center;
}

module.exports = centroid;
