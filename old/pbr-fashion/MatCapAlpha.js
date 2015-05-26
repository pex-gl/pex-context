//http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader

var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var MatCapAlphaGLSL = fs.readFileSync(__dirname + '/MatCapAlpha.glsl', 'utf8');

function MatCapAlpha(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(MatCapAlphaGLSL);
  var defaults = {};
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

MatCapAlpha.prototype = Object.create(Material.prototype);

module.exports = MatCapAlpha;
