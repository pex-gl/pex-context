var createWindow = require('./sys/createWindow');

var Program      = require('./glu/Program');
var VertexArray  = require('./glu/VertexArray');
var Context      = require('./glu/Context');
var ClearCommand = require('./glu/ClearCommand');
var DrawCommand  = require('./glu/DrawCommand');

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
    this.context = new Context(gl);

    this.quadProgram = new Program(gl, VERT_SRC, FRAG_SRC);

    this.quadVA = new VertexArray(gl);
    this.quadVA.addAttribute('position', [
      -1, 1, 1, 1, 1,-1,
      -1, 1, 1,-1, -1,-1
    ], { size: 2 });

    this.clearCmd = new ClearCommand({
      color: [0.2, 0.2, 0.2, 1.0],
      depth: true
    });

    this.quadDrawCmd = new DrawCommand({
      vertexArray: this.quadVA,
      program: this.quadProgram,
      renderState: {
        depthTest: {
          enabled: true
        }
      }
    });
  },
  draw: function() {
    this.clearCmd.execute(this.context);
    this.quadDrawCmd.execute(this.context);
  }
})
