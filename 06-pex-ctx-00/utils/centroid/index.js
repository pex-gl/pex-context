var add = require('../../math/Vec3').add;
var scale = require('../../math/Vec3').scale;

function centroid(points) {
  var n = points.length;
  var center = points.reduce(function(center, p) {
    return add(center, p);
  }, [0, 0, 0]);
  scale(center, 1 / points.length);
  return center;
}

module.exports = centroid;
