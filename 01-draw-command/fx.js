var createWindow = require('./sys/createWindow');

var Program      = require('./glu/Program');
var VertexArray  = require('./glu/VertexArray');
var Context      = require('./glu/Context');
var Texture2D    = require('./glu/Texture2D');
var Framebuffer  = require('./glu/Framebuffer');
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

//TODO: How to make this Gamma correct?
var DOWNSAMPLE_FRAG = '\
varying vec2 vTexCoord; \
uniform sampler2D texture; \
uniform vec2 textureSize; \
void main() { \
  vec2 texel = vec2(1.0 / textureSize.x, 1.0 / textureSize.y); \
  vec3 color = vec3(0.0); \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -2.0, texel.y * -2.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -1.0, texel.y * -2.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  0.0, texel.y * -2.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  1.0, texel.y * -2.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -2.0, texel.y * -1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -1.0, texel.y * -1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  0.0, texel.y * -1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  1.0, texel.y * -1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -2.0, texel.y *  0.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -1.0, texel.y *  0.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  0.0, texel.y *  0.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  1.0, texel.y *  0.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -2.0, texel.y *  1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x * -1.0, texel.y *  1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  0.0, texel.y *  1.0)).rgb; \
  color += texture2D(texture, vTexCoord + vec2(texel.x *  1.0, texel.y *  1.0)).rgb; \
  gl_FragColor = vec4(color / 16.0, 1.0); \
} \
';

//TODO: How to make this Gamma correct?
var BLUR_3_H_FRAG = '\
varying vec2 vTexCoord; \
uniform sampler2D texture; \
uniform vec2 textureSize; \
void main() { \
  vec2 texel = vec2(1.0 / textureSize.x, 1.0 / textureSize.y); \
  vec4 color = vec4(0.0); \
  color += 0.25 * texture2D(texture, vTexCoord + vec2(texel.x * -1.0, 0.0)); \
  color += 0.50 * texture2D(texture, vTexCoord); \
  color += 0.25 * texture2D(texture, vTexCoord + vec2(texel.x *  1.0, 0.0)); \
  gl_FragColor = color; \
} \
';

//TODO: How to make this Gamma correct?
var BLUR_3_V_FRAG = '\
varying vec2 vTexCoord; \
uniform sampler2D texture; \
uniform vec2 textureSize; \
void main() { \
  vec2 texel = vec2(1.0 / textureSize.x, 1.0 / textureSize.y); \
  vec4 color = vec4(0.0); \
  color += 0.25 * texture2D(texture, vTexCoord + vec2(0.0, texel.x * -1.0)); \
  color += 0.50 * texture2D(texture, vTexCoord); \
  color += 0.25 * texture2D(texture, vTexCoord + vec2(0.0, texel.x *  1.0)); \
  gl_FragColor = color; \
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

    //RENDER COLOR

    this.clearCmd = new ClearCommand({
      color: [0.2, 0.82, 0.2, 1.0],
      depth: true
    });

    this.colorFBO = new Framebuffer(gl, this.width, this.height, { depth: true, nearest: true });

    this.clearRenderTargetCmd = new ClearCommand({
      color: [0.92, 0.2, 0.2, 1.0],
      depth: true,
      framebuffer: this.colorFBO
    });

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
      },
      viewport: [0, 0, this.width, this.height],
      framebuffer: this.colorFBO
    });

    //DOWNSAMPLE
    this.quad = createFSQ(gl);
    this.downsampleProgram = new Program(gl, BLIT_VERT, DOWNSAMPLE_FRAG);

    this.downsampleFBO = new Framebuffer(gl, this.width/4, this.height/4);
    this.downsampleCmd = new DrawCommand({
      vertexArray: this.quad,
      program: this.downsampleProgram,
      renderState: {
        depthTest: {
          enabled: false
        }
      },
      uniforms: {
        //FIXME: This is automagic asssining texture to a next available texture unit.
        //FIXME: How to implement texture sampler objects?
        texture: this.colorFBO.getColorAttachment(0),
        textureSize: [ this.colorFBO.getColorAttachment(0).width, this.colorFBO.getColorAttachment(0).height ]
      },
      viewport: [0, 0, this.width/4, this.height/4],
      framebuffer: this.downsampleFBO
    });

    //BLUR H
    this.blur3HProgram = new Program(gl, BLIT_VERT, BLUR_3_H_FRAG);

    this.blur3HFBO = new Framebuffer(gl, this.width/4, this.height/4);
    this.blur3HCmd = new DrawCommand({
      vertexArray: this.quad,
      program: this.blur3HProgram,
      renderState: {
        depthTest: {
          enabled: false
        }
      },
      uniforms: {
        //FIXME: This is automagic asssining texture to a next available texture unit.
        //FIXME: How to implement texture sampler objects?
        texture: this.downsampleFBO.getColorAttachment(0),
        textureSize: [ this.downsampleFBO.getColorAttachment(0).width, this.downsampleFBO.getColorAttachment(0).height ]
      },
      viewport: [0, 0, this.width/4, this.height/4],
      framebuffer: this.blur3HFBO
    });

    //BLUR V
    this.blur3VProgram = new Program(gl, BLIT_VERT, BLUR_3_V_FRAG);

    this.blur3VFBO = new Framebuffer(gl, this.width/4, this.height/4);
    this.blur3VCmd = new DrawCommand({
      vertexArray: this.quad,
      program: this.blur3VProgram,
      renderState: {
        depthTest: {
          enabled: false
        }
      },
      uniforms: {
        //FIXME: This is automagic asssining texture to a next available texture unit.
        //FIXME: How to implement texture sampler objects?
        texture: this.blur3HFBO.getColorAttachment(0),
        textureSize: [ this.blur3HFBO.getColorAttachment(0).width, this.blur3HFBO.getColorAttachment(0).height ]
      },
      viewport: [0, 0, this.width/4, this.height/4],
      framebuffer: this.blur3VFBO
    });

    //BLIT

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
        texture: this.blur3VFBO.getColorAttachment(0)
      },
      viewport: [0, 0, this.width, this.height],
    });
  },
  draw: function() {
    var gl = this.gl;

    var t = (Date.now() - this.timeStart)/1000;

    this.eye.x = 4*Math.cos(t);
    this.eye.z = 4*Math.sin(t);
    var viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up).toArray();

    //this.cubeDrawCmd.uniforms.viewMatrix = viewMatrix;

    this.context.submit(this.clearCmd);
    this.context.submit(this.clearRenderTargetCmd);
    this.context.submit(this.cubeDrawCmd);
    this.context.submit(this.downsampleCmd);
    this.context.submit(this.blur3HCmd);
    this.context.submit(this.blur3VCmd);
    this.context.submit(this.blitCmd);
    this.context.render();
  }
})
