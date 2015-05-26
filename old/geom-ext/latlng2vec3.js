var DegToRad = Math.PI / 180.0;
var Vec3 = require('pex-geom').Vec3;

function latlng2vec3(latLng, r) {
  var lat = latLng[0];
  var lng = latLng[1];
  var r = typeof(r) === 'undefined' ? 1 : r;
  var pos = new Vec3();
  pos.x = r * Math.sin((90 - lat) * DegToRad) * Math.sin(lng * DegToRad);
  pos.y = r * Math.cos((90 - lat) * DegToRad);
  pos.z = r * Math.sin((90 - lat) * DegToRad) * Math.cos(lng * DegToRad);
  return pos;
}

module.exports = latlng2vec3;