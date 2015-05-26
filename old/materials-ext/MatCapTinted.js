//http://www.clicktorelease.com/blog/creating-spherical-environment-mapping-shader

var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var MatCapTintedGLSL = fs.readFileSync(__dirname + '/MatCapTinted.glsl', 'utf8');

function MatCapTinted(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(MatCapTintedGLSL);
  var defaults = {
    tintColor: Color.White
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

MatCapTinted.prototype = Object.create(Material.prototype);

module.exports = MatCapTinted;
