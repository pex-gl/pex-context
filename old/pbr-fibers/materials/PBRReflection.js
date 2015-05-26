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

var PBRColorGLSL = fs.readFileSync(__dirname + '/PBRColor.glsl', 'utf8');

function PBRColor(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(PBRColorGLSL);
  var defaults = {
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

PBRColor.prototype = Object.create(Material.prototype);

module.exports = PBRColor;
