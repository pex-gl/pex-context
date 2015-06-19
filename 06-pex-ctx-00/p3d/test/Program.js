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

Window.create({
  settings: {
    type: '3d'
  },
  init: function() {
    var ctx = this.getContext();
    //TODO: new Program(ctx, VERT_SRC, FRAG_SRC) -> ctx.createProgram(VERT_SRC, FRAG_SRC)
    var program = new Program(ctx, VERT_SRC, FRAG_SRC);
    program.bind();
    program.setUniform('uColor', [1, 0, 0, 1]);
    program.unbind();
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
