var Window = require('../../sys/Window');
var Program = require('../Program');

var VERT_SRC = '\
attribute vec2 position; \
void main() { \
  gl_Position = vec4(position, 0.0, 1.0); \
} \
';

var FRAG_SRC = '\
void main() { \
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \
} \
';

Window.create({
  settings: {
    type: '3d'
  },
  init: function() {
    var ctx = this.getContext();
    var program = new Program(ctx, VERT_SRC, FRAG_SRC);
    program.bind();
    program.unbind();
  },
  update: function() {

  },
  draw: function() {
    var ctx = this.getContext();
  }
})
