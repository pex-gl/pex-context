var geom = require('pex-geom');
var color = require('pex-color');
var glu = require('pex-glu');
var gen = require('pex-gen');
var materials = require('pex-materials');

var Vec3 = geom.Vec3;
var Color = color.Color;
var Mesh = glu.Mesh;
var Plane = gen.Plane;
var Sphere = gen.Sphere;
var SolidColor = materials.SolidColor;

function GlobalLight(intensity, reflectionMap, diffuseMap, color) {
  Mesh.call(this, new Sphere(0.000001), new SolidColor({ color: Color.White }));

  this.position = new Vec3(0, 0, 0);
  this.color = color;
  this.intensity = intensity || 1;
  this.reflectionMap = reflectionMap;
  this.diffuseMap = diffuseMap;

  this.proxyMesh = new Mesh(new Plane(2), null); //no material for now, will be assigned by the renderer
}

GlobalLight.prototype = Object.create(Mesh.prototype);

GlobalLight.prototype.setIntensity = function(intensity) {
  this.intensity = intensity;
}

GlobalLight.prototype.getIntensity = function() {
  return this.intensity;
}

module.exports = GlobalLight;