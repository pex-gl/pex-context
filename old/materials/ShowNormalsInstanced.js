var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var ShowNormalsInstancedGLSL = fs.readFileSync(__dirname + '/ShowNormalsInstanced.glsl', 'utf8');

function ShowNormalsInstanced(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(ShowNormalsInstancedGLSL);
  var defaults = { pointSize: 1 };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

ShowNormalsInstanced.prototype = Object.create(Material.prototype);

module.exports = ShowNormalsInstanced;