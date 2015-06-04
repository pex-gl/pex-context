var createWindow = require('./sys/createWindow');

var Program      = require('./glu/Program');
var VertexArray  = require('./glu/VertexArray');
var Context      = require('./glu/Context');
var Texture2D    = require('./glu/Texture2D');
var FrameBuffer  = require('./glu/FrameBuffer');
var ClearCommand = require('./glu/ClearCommand');
var DrawCommand  = require('./glu/DrawCommand');
var Vec3         = require('./geom/Vec3');
var Mat4         = require('./geom/Mat4');
var createCube   = require('./vgen/createCube');
var createFSQ    = require('./vgen/createFullScreenQuad');

var CUBE_VERT = '\
attribute vec3 position; \
attribute vec3 normal; \
uniform mat4 projectionMatrix; \
uniform mat4 viewMatrix; \
varying vec4 vColor; \
void main() { \
  gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0); \
  vColor = vec4(normal/2.0 + 0.5, 1.0); \
} \
';

var CUBE_FRAG = '\
varying vec4 vColor; \
void main() { \
  gl_FragColor = vColor; \
} \
';

var BLIT_VERT = '\
attribute vec2 position; \
attribute vec2 texCoord; \
varying vec2 vTexCoord; \
void main() { \
  gl_Position = vec4(position, 0.0, 1.0); \
  vTexCoord = texCoord; \
} \
';

var BLIT_FRAG = '\
varying vec2 vTexCoord; \
uniform sampler2D texture; \
void main() { \
  gl_FragColor = vec4(vTexCoord, 0.0, 1.0); \
  gl_FragColor = texture2D(texture, vTexCoord); \
} \
';

createWindow({
  settings: {
    width: 1280,
    height: 720
  },
  init: function() {
    this.framerate(30);

    var gl = this.gl;

    this.context = new Context(gl);

    this.timeStart = Date.now();
    this.eye = new Vec3(4, 2, 4);
    this.target = new Vec3(0, 0, 0);
    this.up = new Vec3(0, 1, 0);

    var projectionMatrix = new Mat4().perspective(60, this.width/this.height, 0.1, 100).toArray();
    var viewMatrix = this.viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up).toArray();

    this.clearCmd = new ClearCommand({
      color: [0.2, 0.2, 0.2, 1.0],
      depth: true
    });

    //this.renderTarget = new FrameBuffer(gl);

    this.cube = createCube(gl);
    this.cubeProgram = new Program(gl, CUBE_VERT, CUBE_FRAG);
    this.cubeDrawCmd = new DrawCommand({
      vertexArray: this.cube,
      program: this.cubeProgram,
      renderState: {
        depthTest: {
          enabled: true
        }
      },
      uniforms: {
        projectionMatrix: projectionMatrix,
        viewMatrix: viewMatrix
      }
    });

    this.quad = createFSQ(gl);
    this.blitProgram = new Program(gl, BLIT_VERT, BLIT_FRAG);
    this.blitCmd = new DrawCommand({
      vertexArray: this.quad,
      program: this.blitProgram,
      renderState: {
        depthTest: {
          enabled: false
        }
      },
      uniforms: {
        //FIXME: This is automagic asssining texture to a next available texture unit. 
        //FIXME: How to implement texture sampler objects?
        texture: Texture2D.genNoise(gl, 256, 256)
      }
    });
  },
  draw: function() {
    var gl = this.gl;

    var t = (Date.now() - this.timeStart)/1000;

    this.eye.x = 4*Math.cos(t);
    this.eye.z = 4*Math.sin(t);
    var viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up).toArray();

    this.cubeDrawCmd.uniforms.viewMatrix = viewMatrix;

    this.context.submit(this.clearCmd);
    this.context.submit(this.cubeDrawCmd);
    this.context.submit(this.blitCmd);
    this.context.render();
  }
})
