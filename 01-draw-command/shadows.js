var debug           = require('debug').enable('!pex/*');
var createWindow    = require('./sys/createWindow');
var Program         = require('./glu/Program');
var VertexArray     = require('./glu/VertexArray');
var Context         = require('./glu/Context');
var ClearCommand    = require('./glu/ClearCommand');
var DrawCommand     = require('./glu/DrawCommand');
var TextureCube     = require('./glu/TextureCube');
var Framebuffer     = require('./glu/Framebuffer');
var Texture2D       = require('./glu/Texture2D');
var Vec3            = require('./geom/Vec3');
var Mat4            = require('./geom/Mat4');
var torus           = require('torus-mesh')();
var createCube      = require('./agen/createCube');
var bunny           = require('bunny');
var normals         = require('normals');
var rescaleVertices = require('rescale-vertices');
var glslify         = require('glslify-promise');
var loadImage       = require('./sys/loadImage');
var Time            = require('./sys/Time');
var loadDDSCubemap  = require('./sys/loadDDSCubemap');
var createFSQ       = require('./vgen/createFullScreenQuad');
var toVertexArray   = require('./glu/createVertexArrayFromGeometry');

createWindow({
  settings: {
    width: 1280,
    height: 720,
    multisample: true
  },
  //Problems with preloading resources
  //-might need gl context
  //-loading files one by one is pita
  resources: {
    ShowNormalsVert: glslify(__dirname + '/sh/materials/ShowNormals.vert'),
    ShowNormalsFrag: glslify(__dirname + '/sh/materials/ShowNormals.frag'),
    ShadowMappedVert: glslify(__dirname + '/sh/materials/ShadowMapped.vert'),
    ShadowMappedFrag: glslify(__dirname + '/sh/materials/ShadowMapped.frag'),
    BlitVert: glslify(__dirname + '/sh/materials/Blit.vert'),
    BlitFrag: glslify(__dirname + '/sh/materials/Blit.frag')
  },
  init: function() {
      this.framerate(60);

      var gl = this.gl;

      this.context = new Context(gl);

      this.timeStart = Date.now();
      this.eye = new Vec3(4, 0, 4);
      this.target = new Vec3(0, 0, 0);
      this.up = new Vec3(0, 1, 0);
      this.lightPos = [4, 7, 4];
      this.lightNear = 1;
      this.lightFar = 50;

      var targetBounds = [
        [-1, -1, -1],
        [ 1,  1,  1]
      ];


      this.camProjectionMatrix = new Mat4().perspective(60, this.width/this.height, 0.1, 100);
      this.lightProjectionMatrix = Mat4.create().perspective(60, 1, this.lightNear, this.lightFar);
      this.lightViewMatrix = Mat4.create().lookAt(new Vec3(this.lightPos[0], this.lightPos[1], this.lightPos[2]), this.target, this.up);

      this.commands = [];

      this.bunnyMesh = toVertexArray(gl, {
        position: rescaleVertices(bunny.positions, targetBounds),
        normal: normals.vertexNormals(bunny.cells, bunny.positions),
        indices: bunny.cells
      });

      this.floorMesh = toVertexArray(gl, createCube(5, 0.1, 5));

      this.drawDepthProgram = new Program(gl, this.resources.ShowNormalsVert, this.resources.ShowNormalsFrag);
      this.drawShadowMappedProgram = new Program(gl, this.resources.ShadowMappedVert, this.resources.ShadowMappedFrag);

      this.depthMap = Texture2D.create(gl, 1024, 1024, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
      this.shadowFBO = new Framebuffer(gl, 1024, 1024, { depth: this.depthMap });

      this.blitProgram = new Program(gl, this.resources.BlitVert, this.resources.BlitFrag);

      this.clearShadowCmd = new ClearCommand({
        color: [0.2, 0.82, 0.2, 1.0],
        depth: true,
        framebuffer: this.shadowFBO
      });

      this.clearCmd = new ClearCommand({
        color: [0.2, 0.2, 0.2, 1.0],
        depth: true
      });

      this.floorDrawShadowCmd = new DrawCommand({
        vertexArray: this.floorMesh,
        program: this.drawDepthProgram,
        uniforms: {
          projectionMatrix  : this.lightProjectionMatrix.toArray(),
          viewMatrix        : this.lightViewMatrix.toArray(),
          modelMatrix       : Mat4.create().translate(0, -1, 0).toArray()
        },
        renderState: {
          depthTest: true
        },
        viewport: [0, 0, 1024, 1024],
        framebuffer: this.shadowFBO
      });

      this.bunnyDrawShadowCmd = new DrawCommand({
        vertexArray: this.bunnyMesh,
        program: this.drawDepthProgram,
        uniforms: {
          projectionMatrix  : this.lightProjectionMatrix.toArray(),
          viewMatrix        : this.lightViewMatrix.toArray(),
          modelMatrix       : Mat4.create().identity().toArray()
        },
        renderState: {
          depthTest: true
        },
        viewport: [0, 0, 1024, 1024],
        framebuffer: this.shadowFBO
      });

      this.floorDrawCmd = new DrawCommand({
        vertexArray: this.floorMesh,
        program: this.drawShadowMappedProgram,
        uniforms: {
          projectionMatrix  : this.camProjectionMatrix.toArray(),
          modelMatrix       : Mat4.create().translate(0, -1, 0).toArray(),
          depthMap          : this.depthMap,
          ambientColor      : [0.0, 0.0, 0.0, 0.0],
          diffuseColor      : [1.0, 1.0, 1.0, 1.0],
          lightPos          : this.lightPos,
          wrap              : 0,
          lightNear         : this.lightNear,
          lightFar          : this.lightFar,
          lightViewMatrix   : this.lightViewMatrix.toArray(),
          lightProjectionMatrix: this.lightProjectionMatrix.toArray()
        },
        renderState: {
          depthTest: true
        }
      });

      this.bunnyDrawCmd = new DrawCommand({
        vertexArray: this.bunnyMesh,
        program: this.drawShadowMappedProgram,
        uniforms: {
          projectionMatrix  : this.camProjectionMatrix.toArray(),
          modelMatrix       : Mat4.create().identity().toArray(),
          depthMap          : this.depthMap,
          ambientColor      : [0.3, 0.3, 0.3, 1.0],
          diffuseColor      : [1.0, 1.0, 1.0, 1.0],
          lightPos          : this.lightPos,
          wrap              : 0,
          lightNear         : this.lightNear,
          lightFar          : this.lightFar,
          lightViewMatrix   : this.lightViewMatrix.toArray(),
          lightProjectionMatrix: this.lightProjectionMatrix.toArray()
        },
        renderState: {
          depthTest: true
        }
      });

      this.quad = createFSQ(gl);

      this.blitTexture = this.depthMap;
      this.blitCmd = new DrawCommand({
        vertexArray: this.quad,
        program: this.blitProgram,
        renderState: {
          depthTest: {
            enabled: false
          }
        },
        uniforms: {
          texture: this.blitTexture,
          textureSize: [ this.blitTexture.width, this.blitTexture.height ]
        }
      });

      this.commands.push(this.clearShadowCmd);
      this.commands.push(this.floorDrawShadowCmd);
      this.commands.push(this.bunnyDrawShadowCmd);
      this.commands.push(this.clearCmd);
      this.commands.push(this.floorDrawCmd);
      this.commands.push(this.bunnyDrawCmd);
      //this.commands.push(this.blitCmd);
  },
  draw: function() {
    Time.verbose = true;
    Time.update();

    var gl = this.gl;

    var t = (Date.now() - this.timeStart)/1000/10;
    t = 0.5;
    this.eye.x = 6*Math.cos(Math.PI * t);
    this.eye.y = 3;
    this.eye.z = 6*Math.sin(Math.PI * t);
    var viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up);

    //FIXME: uniform leaking
    this.floorDrawCmd.uniforms.viewMatrix = viewMatrix.toArray();
    this.floorDrawCmd.uniforms.invViewMatrix = viewMatrix.dup().invert().toArray();
    this.floorDrawCmd.uniforms.normalMatrix = viewMatrix.dup().invert().transpose().toArray();
    this.bunnyDrawCmd.uniforms.viewMatrix = viewMatrix.toArray();
    this.bunnyDrawCmd.uniforms.invViewMatrix = viewMatrix.dup().invert().toArray();
    this.bunnyDrawCmd.uniforms.normalMatrix = viewMatrix.dup().invert().transpose().toArray();

    this.commands.forEach(function(cmd) {
      this.context.submit(cmd);
    }.bind(this));
    this.context.render({debug: true});
  }
})
