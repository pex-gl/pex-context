var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');

var HemisphereGLSL = fs.readFileSync(__dirname + '/Hemisphere.glsl', 'utf8');

function Hemisphere(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(HemisphereGLSL);
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

Hemisphere.prototype = Object.create(Material.prototype);

module.exports = Hemisphere;