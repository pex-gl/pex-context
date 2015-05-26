var geom = require('pex-geom');
var color = require('pex-color');
var glu = require('pex-glu');
var gen = require('pex-gen');
var materials = require('pex-materials');

var Vec3 = geom.Vec3;
var Color = color.Color;
var Mesh = glu.Mesh;
var Sphere = gen.Sphere;
var SolidColor = materials.SolidColor;

function PointLight(position, color, radius, brightness) {
  Mesh.call(this, new Sphere(1), new SolidColor({ color: color }));

  this.position = position || new Vec3(0, 0, 0);
  this.color = color || Color.White;
  this.radius = radius || 5;
  this.brightness = brightness || 1;

  this.proxyMesh = new Mesh(new Sphere(1, 64, 64), null); //no material for now, will be assigned by the renderer
  this.proxyMesh.scale.set(this.radius, this.radius, this.radius);
  this.proxyMesh.position = this.position;

  var gizmoGeom = new Sphere(1, 8, 8);
  gizmoGeom.computeEdges();
  this.gizmoMesh = new Mesh(gizmoGeom, new SolidColor({ color: Color.Red }), { lines: true })
  this.gizmoMesh.scale.set(this.radius, this.radius, this.radius);

  //force proxy light properties to be always in sync
  var proxyDraw = this.proxyMesh.draw.bind(this.proxyMesh);
  var self = this;
  this.proxyMesh.draw = function(camera) {
    self.proxyMesh.scale.set(self.radius, self.radius, self.radius);
    self.proxyMesh.position = self.position;
    self.gizmoMesh.scale.set(self.radius, self.radius, self.radius);
    self.gizmoMesh.position = self.position;
    self.material.uniforms.color = self.color;
    proxyDraw(camera);
  }
}

PointLight.prototype = Object.create(Mesh.prototype);

PointLight.prototype.setRadius = function(radius) {
  this.radius = radius;
  this.proxyMesh.scale.set(this.radius, this.radius, this.radius);

  var s = Math.min(this.radius/5, 1);
  this.scale.set(s, s, s);
}

PointLight.prototype.getRadius = function() {
  return this.radius;
}

PointLight.prototype.setPosition = function(position) {
  this.position.setVec3(position);
  this.proxyMesh.position.setVec3(position);
}

PointLight.prototype.getPosition = function() {
  return this.position;
}

PointLight.prototype.setBrightness = function(brightness) {
  this.brightness = brightness;
}

PointLight.prototype.getBrightness = function() {
  return this.brightness;
}

PointLight.prototype.setColor = function(color) {
  this.color = color;
}

PointLight.prototype.getColor = function() {
  return this.color;
}

module.exports = PointLight;