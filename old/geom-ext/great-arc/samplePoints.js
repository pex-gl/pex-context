var interpolateGreatArc = require('./interpolate');

//Sample numPoints on the great arc between two points on the sphere
//from = [ lat deg, lng deg ]
//to   = [ lat deg, lng deg ]
//numPoints = int (min is 2)
function samplePoints(from, to, numPoints) {
  var points = [];
  for(var i=0; i<numPoints; i++) {
    var t = i / (numPoints - 1);
    var p = interpolateGreatArc(from, to, t);
    points.push(p);
  }
  return points;
}

module.exports = samplePoints;