var distanceGreatArc = require('./distance');
var DegToRad = Math.PI / 180.0;

//Interpolate between two points along the great arc
//Based on http://williams.best.vwh.net/avform.htm
//from = [ lat deg, lng deg ]
//to   = [ lat deg, lng deg ]
//t    = 0..1
function interpolate(from, to, t) {
  var dist = distanceGreatArc(from, to);

  if (dist == Math.PI) {
    throw new Error('interpolateGreatArc the points ' + from + ' and ' + to + ' are antipodal');
  }
  var A = Math.sin((1 - t) * dist) / Math.sin(dist);
  var B = Math.sin(t * dist) / Math.sin(dist);
  var x = A * Math.cos(from[0] * DegToRad) * Math.cos(from[1] * DegToRad) + B * Math.cos(to[0] * DegToRad) * Math.cos(to[1] * DegToRad);
  var y = A * Math.cos(from[0] * DegToRad) * Math.sin(from[1] * DegToRad) + B * Math.cos(to[0] * DegToRad) * Math.sin(to[1] * DegToRad);
  var z = A * Math.sin(from[0] * DegToRad) + B * Math.sin(to[0] * DegToRad);
  var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
  var lon = Math.atan2(y, x);
  return [ lat / DegToRad, lon / DegToRad ];
};

module.exports = interpolate;