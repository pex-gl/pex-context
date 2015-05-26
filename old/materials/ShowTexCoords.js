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

var ShowTexCoordsGLSL = fs.readFileSync(__dirname + '/ShowTexCoords.glsl', 'utf8');

function ShowTexCoords(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(ShowTexCoordsGLSL);
  var defaults = {
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

ShowTexCoords.prototype = Object.create(Material.prototype);

module.exports = ShowTexCoords;