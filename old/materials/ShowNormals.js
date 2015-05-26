var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var ShowNormalsGLSL = fs.readFileSync(__dirname + '/ShowNormals.glsl', 'utf8');

function ShowNormals(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(ShowNormalsGLSL);
  var defaults = { pointSize: 1 };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

ShowNormals.prototype = Object.create(Material.prototype);

module.exports = ShowNormals;