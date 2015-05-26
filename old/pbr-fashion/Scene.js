var glu = require('pex-glu');
var PerspectiveCamera = glu.PerspectiveCamera;
var PointLight = require('./PointLight');
var GlobalLight = require('./GlobalLight');
var Mesh = glu.Mesh;

function Scene() {
  this.items = [];
}

Scene.prototype.add = function(o) {
  this.items.push(o);
}

Scene.prototype.remove = function(o) {
  var i = this.items.indexOf(o);
  if (i > -1) {
    this.items.splice(i, 1);
  }
}

Scene.prototype.clear = function() {
  //TODO: Dispose?
  this.items.length = 0;
}

Scene.prototype.getCameras = function() {
  return this.items.filter(function(p) {
    return p instanceof PerspectiveCamera;
  });
}

Scene.prototype.getMeshes = function() {
  return this.items.filter(function(p) {
    return p instanceof Mesh && !(p instanceof PointLight) && !(p instanceof GlobalLight);
  });
}

Scene.prototype.getLights = function() {
  return this.items.filter(function(p) {
    return p instanceof PointLight || p instanceof GlobalLight;
  });
}

module.exports = Scene;