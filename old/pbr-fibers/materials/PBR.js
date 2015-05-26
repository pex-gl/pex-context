var glu = require('pex-glu');
var color = require('pex-color');
var geom = require('pex-geom');
var Context = glu.Context;
var Material = glu.Material;
var Program = glu.Program;
var Color = color.Color;
var Vec3 = geom.Vec3;
var merge = require('merge');
var fs = require('fs');

var PBRGLSL = fs.readFileSync(__dirname + '/PBR.glsl', 'utf8');

function PBR(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(PBRGLSL);
  var defaults = {
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

PBR.prototype = Object.create(Material.prototype);

module.exports = PBR;
