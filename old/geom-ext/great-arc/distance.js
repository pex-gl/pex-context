var DegToRad = 1/180.0 * Math.PI;

//Great arc length / Great circle distance between 2 points on the sphere
//Assuming R = 1
//Based on http://williams.best.vwh.net/avform.htm
//from = [ lat deg, lng deg ]
//to   = [ lat deg, lng deg ]
function distance(from, to) {
  return Math.acos(Math.sin(from[0] * DegToRad) * Math.sin(to[0] * DegToRad) + Math.cos(from[0] * DegToRad) * Math.cos(to[0] * DegToRad) * Math.cos(from[1] * DegToRad - to[1] * DegToRad))
}

module.exports = distance;