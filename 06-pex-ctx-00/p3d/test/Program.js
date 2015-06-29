var Window = require('../../sys/Window');
var Program = require('../Program');

var VERT_SRC = '\
attribute vec2 position; \
void main() { \
  gl_Position = vec4(position, 0.0, 1.0); \
} \
';

var FRAG_SRC = '\
uniform vec4 uColor; \
void main() { \
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \
  gl_FragColor = uColor; \
} \
';

//Vertex source with undefined attribute
//var VERT_SRC = '\
//attribute vec2 position; \
//void main() { \
//  gl_Position = vec4(positionUndefined, 0.0, 1.0); \
//} \
//';

//Fragment source with undefined uniform
//var FRAG_SRC = '\
//uniform vec4 uColor; \
//void main() { \
//  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \
//  gl_FragColor = uColorUndefined; \
//} \
//';


Window.create({
  settings: {
    type: '3d'
  },
  init: function() {
    var ctx = this.getContext();
    var program = ctx.createProgram(VERT_SRC, FRAG_SRC);
    ctx.bindProgram(program);
    program.setUniform('uColor', [1, 0, 0, 1])
  },
  update: function() {

  },
  draw: function() {
    var ctx = this.getContext();
    //ctx.setClearColor([1, 0, 0, 1]);
    ctx.setClearColor(1, 0, 0, 1);

    ctx.clear(ctx.COLOR_BIT);
  }
})
