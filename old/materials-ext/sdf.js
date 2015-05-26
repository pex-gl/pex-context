var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SDFGLSL = fs.readFileSync(__dirname + '/SDF.glsl', 'utf8');

function SDF(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SDFGLSL);
  var defaults = {
    color: Color.White,
    smoothing: 1/16
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SDF.prototype = Object.create(Material.prototype);

module.exports = SDF;
