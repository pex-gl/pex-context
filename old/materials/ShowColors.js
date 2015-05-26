var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var ShowColorsGLSL = fs.readFileSync(__dirname + '/ShowColors.glsl', 'utf8');

function ShowColors(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(ShowColorsGLSL);
  var defaults = { pointSize: 1 };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

ShowColors.prototype = Object.create(Material.prototype);

module.exports = ShowColors;