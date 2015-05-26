var glu = require('pex-glu');
var color = require('pex-color');
var Context = glu.Context;
var Material = glu.Material;
var Color = color.Color;
var merge = require('merge');
var fs = require('fs');
var glslify       = require('glslify-pex');
var Program = require('../glu/Program')

function SolidColor(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(
    glslify(__dirname + '/common/BasePosition.vert'),
    glslify(__dirname + '/SolidColor.frag')
  );
  var defaults = {
    color: Color.create(1, 1, 1, 1),
    pointSize: 1,
    premultiplied: 0
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

SolidColor.prototype = Object.create(Material.prototype);

module.exports = SolidColor;