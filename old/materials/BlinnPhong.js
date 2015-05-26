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

var BlinnPhongGLSL = fs.readFileSync(__dirname + '/BlinnPhong.glsl', 'utf8');

var dupa ="SELECT UPDATE INSERT INTO   bla bla howhow";

//TODO: test if this works
//FIXME: everywhere!
var shader = "/*GLSL*/\
uniform mat4 projectionMatrix; \
uniform mat4 modelViewMatrix; \
uniform mat4 modelWorldMatrix; \
uniform mat4 viewMatrix; \
uniform mat4 normalMatrix; \
uniform float pointSize; \
uniform vec3 lightPos; \
uniform vec3 cameraPos; \
attribute vec3 position; \
attribute vec3 normal; \
varying vec3 vNormal; \
varying vec3 vLightPos; \
varying vec3 vEyePos; \
 \
void main() { \
  vec4 worldPos = modelWorldMatrix * vec4(position, 1.0); \
  vec4 eyePos = modelViewMatrix * vec4(position, 1.0); \
  gl_Position = projectionMatrix * eyePos; \
  vEyePos = eyePos.xyz; \
  gl_PointSize = pointSize; \
  vNormal = (normalMatrix * vec4(normal, 0.0)).xyz; \
  vLightPos = (viewMatrix * vec4(lightPos, 1.0)).xyz; \
} \
";

function BlinnPhong(uniforms) {
  this.gl = Context.currentContext;
  var program = new Program(BlinnPhongGLSL);
  var defaults = {
    wrap: 0,
    pointSize: 1,
    lightPos: Vec3.create(10, 20, 30),
    ambientColor: Color.create(0, 0, 0, 1),
    diffuseColor: Color.create(0.9, 0.9, 0.9, 1),
    specularColor: Color.create(1, 1, 1, 1),
    shininess: 256,
    useBlinnPhong: true
  };
  uniforms = merge(defaults, uniforms);
  Material.call(this, program, uniforms);
}

BlinnPhong.prototype = Object.create(Material.prototype);

module.exports = BlinnPhong;
