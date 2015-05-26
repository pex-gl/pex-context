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

var BackgroundGradientGLSL = fs.readFileSync(__dirname + '/BackgroundGradient.glsl', 'utf8');

function BackgroundGradient(uniforms) {
    var gl = Context.currentContext;
    var program = new glu.Program(BackgroundGradientGLSL);

    var defaults = {
      topColor : new Color(1, 1, 0, 1),
      bottomColor : new Color(1, 0, 0, 1),
      labMixing : false
    };

    uniforms = merge(defaults, uniforms);

    Material.call(this, program, uniforms);
}

BackgroundGradient.prototype = Object.create(Material.prototype);

module.exports = BackgroundGradient;