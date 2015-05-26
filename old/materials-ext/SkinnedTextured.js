var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkinnedTexturedGLSL = fs.readFileSync(__dirname + '/SkinnedTextured.glsl', 'utf8');

function SkinnedTextured(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkinnedTexturedGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkinnedTextured.prototype = Object.create(Material.prototype);

module.exports = SkinnedTextured;