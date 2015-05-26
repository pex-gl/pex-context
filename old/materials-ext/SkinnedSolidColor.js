var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkinnedSolidColorGLSL = fs.readFileSync(__dirname + '/SkinnedSolidColor.glsl', 'utf8');

function SkinnedSolidColor(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkinnedSolidColorGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkinnedSolidColor.prototype = Object.create(Material.prototype);

module.exports = SkinnedSolidColor;