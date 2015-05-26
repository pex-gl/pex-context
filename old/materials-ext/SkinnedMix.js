var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var SkinnedMixGLSL = fs.readFileSync(__dirname + '/SkinnedMix.glsl', 'utf8');

function SkinnedMix(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(SkinnedMixGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SkinnedMix.prototype = Object.create(Material.prototype);

module.exports = SkinnedMix;