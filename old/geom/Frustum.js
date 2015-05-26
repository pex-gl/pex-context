//Frustum in the world space
function Frustum(clippingPlanes) {
  this.planes = clippingPlanes;
}

Frustum.prototype.containsPoint = function(p) {
  //distanceSigned
  for(var i=0; i<this.planes.length; i++) {
    if (this.planes[i].distanceSigned(p) < 0) return false;
  }
  return true;
}

module.exports = Frustum;