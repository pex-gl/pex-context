var createWindow = require('./sys/createWindow');

var Program = require('./glu/Program');
var Mesh    = require('./glu/Mesh');

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

createWindow({
  settings: {
    width: 1280,
    height: 720
  },
  init: function() {
    var gl = this.gl;
    this.program = new Program(gl, VERT_SRC, FRAG_SRC);
    this.mesh = new Mesh(gl);
    this.mesh.addAttribute('position', [
      -1, 1, 1, 1, 1,-1,
      -1, 1, 1,-1, -1,-1
    ], { size: 2 });
  },
  draw: function() {
    var gl = this.gl;

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.program.bind();
    this.mesh.bind(this.program);
    this.mesh.draw();
    this.mesh.unbind(this.program);
    this.program.unbind();
  }
})
