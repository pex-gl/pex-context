//Stack example implemented on top of DrawCommand
//method names like `stack.program()` instead of `stack.setProgram()` are up for discussion

var createWindow = require('./sys/createWindow');

var Program      = require('./glu/Program');
var VertexArray  = require('./glu/VertexArray');
var Context      = require('./glu/Context');
var Stack        = require('./glu/Stack');
var ClearCommand = require('./glu/ClearCommand');
var DrawCommand  = require('./glu/DrawCommand');
var Vec3         = require('./geom/Vec3');
var Mat4         = require('./geom/Mat4');
var Quat         = require('./geom/Quat');
var createCube   = require('./vgen/createCube');

var VERT_SRC = '\
attribute vec3 position; \
attribute vec3 normal; \
uniform mat4 projectionMatrix; \
uniform mat4 viewMatrix; \
uniform mat4 modelMatrix; \
varying vec3 vNormal; \
void main() { \
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); \
  vNormal = normal; \
} \
';

var FRAG_SRC = '\
varying vec3 vNormal; \
uniform vec4 color; \
void main() { \
  vec3 L = normalize(vec3(0.0, 10.0, 10.0)); \
  vec3 N = normalize(vNormal); \
  float NdotL = max(0.0, dot(N, L)); \
  gl_FragColor = color * NdotL; \
} \
';

createWindow({
  settings: {
    width: 1280,
    height: 720
  },
  init: function() {
    this.framerate(60);

    var gl = this.gl;

    this.context = new Context(gl);
    this.stack = new Stack(this.context);

    this.program = new Program(gl, VERT_SRC, FRAG_SRC);

    this.timeStart = Date.now();

    //these should be arrays if our internal math supports arrays
    this.eye = new Vec3(0, 0, 3);
    this.target = new Vec3(0, 0, 0);
    this.up = new Vec3(0, 1, 0);

    this.projectionMatrix = new Mat4().perspective(60, this.width/this.height, 0.1, 100).toArray();
    this.viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up).toArray();

    this.cubeVA = createCube(gl);
  },
  draw: function() {
    var stack = this.stack;
    stack.clearColor(0.2, 0.5, 0.2, 1.0);
    stack.clearDepth();

    stack.perspective(60, this.width/this.height, 0.1, 100);
    stack.lookAt(this.eye, this.target, this.up);
    stack.program(this.program);

    stack.push();
      stack.translate(-1.0, 0.0, 0.0);
      stack.scale(0.5, 0.5, 0.5);
      stack.uniform('color', [1.0, 1.0, 0.0, 1.0 ]);
      stack.drawVertexArray(this.cubeVA);
    stack.pop();
    stack.push();
      stack.translate( 1.0, 0.0, 0.0);
      stack.scale(0.5, 0.5, 0.5);
      stack.uniform('color', [1.0, 0.0, 0.0, 1.0 ]);
      stack.drawVertexArray(this.cubeVA);
    stack.pop();

    stack.render();
  }
})
