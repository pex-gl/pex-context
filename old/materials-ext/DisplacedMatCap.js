//http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader

var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var DisplacedMatCapGLSL = fs.readFileSync(__dirname + '/DisplacedMatCap.glsl', 'utf8');

function DisplacedMatCap(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(DisplacedMatCapGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

DisplacedMatCap.prototype = Object.create(Material.prototype);

module.exports = DisplacedMatCap;
