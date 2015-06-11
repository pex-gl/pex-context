//debug
var debug           = require('debug').enable('!pex/*');

//sys
var createWindow    = require('./sys/createWindow');
var loadImage       = require('./sys/loadImage');
var Time            = require('./sys/Time');
var loadDDSCubemap  = require('./sys/loadDDSCubemap');

//glu
var Program         = require('./glu/Program');
var VertexArray     = require('./glu/VertexArray');
var Context         = require('./glu/Context');
var ClearCommand    = require('./glu/ClearCommand');
var DrawCommand     = require('./glu/DrawCommand');
var TextureCube     = require('./glu/TextureCube');
var Framebuffer     = require('./glu/Framebuffer');
var Texture2D       = require('./glu/Texture2D');
var toVertexArray   = require('./glu/createVertexArrayFromGeometry');

//geom
var createCube      = require('./agen/createCube');
var createFSQ       = require('./vgen/createFullScreenQuad');
var bunny           = require('bunny');
var torus           = require('torus-mesh')();
var normals         = require('normals');
var rescaleVertices = require('rescale-vertices');

//math
var createMat4      = require('gl-mat4/create');
var lookAt          = require('gl-mat4/lookAt');
var perspective     = require('gl-mat4/perspective');
var translate       = require('gl-mat4/translate');

//shaders
var glslify         = require('glslify-promise');

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
      try {
        this.framerate(60);
        this.initMeshes();
        this.initResources();
        this.initCommands();

      }
      catch(e) {
        console.log(e);
      }
  },
  initMeshes: function() {
    var gl = this.gl;

    var targetBounds = [
      [-1, -1, -1],
      [ 1,  1,  1]
    ];

    this.bunnyMesh = toVertexArray(gl, {
      position: rescaleVertices(bunny.positions, targetBounds),
      normal: normals.vertexNormals(bunny.cells, bunny.positions),
      indices: bunny.cells
    });

    this.floorMesh = toVertexArray(gl, createCube(5, 0.1, 5));
  },
  initResources: function() {
    var gl          = this.gl;
    this.context    = new Context(gl);
    this.eye        = [4, 0, 4];
    this.target     = [0, 0, 0];
    this.up         = [0, 1, 0];
    this.lightPos   = [4, 7, 4];
    this.lightNear  = 1;
    this.lightFar   = 50;

    this.shadowMapSize = 1024;

    this.camProjectionMatrix   = perspective(createMat4(), Math.PI/4, this.width/this.height, 0.1, 100);
    this.lightProjectionMatrix = perspective(createMat4(), Math.PI/4, 1, this.lightNear, this.lightFar);
    this.lightViewMatrix       = lookAt(createMat4(), this.lightPos, this.target, this.up);
    this.viewMatrix            = createMat4();
    this.bunnyModelMatrix      = createMat4();
    this.floorModelMatrix      = createMat4();
    //NOTE: this is ugly, can't do in inplace when creating matrix
    translate(this.floorModelMatrix, this.floorModelMatrix, [0, -1, 0]);

    this.drawDepthProgram = new Program(gl, this.resources.ShowNormalsVert, this.resources.ShowNormalsFrag);
    this.drawShadowMappedProgram = new Program(gl, this.resources.ShadowMappedVert, this.resources.ShadowMappedFrag);

    this.depthMap = Texture2D.create(gl, this.shadowMapSize, this.shadowMapSize, { format: this.gl.DEPTH_COMPONENT, type: this.gl.UNSIGNED_SHORT });
    this.shadowFBO = new Framebuffer(gl, this.shadowMapSize, this.shadowMapSize, { depth: this.depthMap });

    this.blitProgram = new Program(gl, this.resources.BlitVert, this.resources.BlitFrag);

    this.quad = createFSQ(gl);

    this.blitTexture = this.depthMap;
  },
  initCommands: function() {
    this.commands = [];

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
        projectionMatrix  : this.lightProjectionMatrix,
        viewMatrix        : this.lightViewMatrix,
        modelMatrix       : this.floorModelMatrix
      },
      renderState: {
        depthTest: true
      },
      viewport: [0, 0, this.shadowFBO.width, this.shadowFBO.height],
      framebuffer: this.shadowFBO
    });

    this.bunnyDrawShadowCmd = new DrawCommand({
      vertexArray: this.bunnyMesh,
      program: this.drawDepthProgram,
      uniforms: {
        projectionMatrix  : this.lightProjectionMatrix,
        viewMatrix        : this.lightViewMatrix,
        modelMatrix       : this.bunnyModelMatrix
      },
      renderState: {
        depthTest: true
      },
      viewport: [0, 0, this.shadowFBO.width, this.shadowFBO.height],
      framebuffer: this.shadowFBO
    });

    this.floorDrawCmd = new DrawCommand({
      vertexArray: this.floorMesh,
      program: this.drawShadowMappedProgram,
      uniforms: {
        projectionMatrix  : this.camProjectionMatrix,
        viewMatrix        : this.viewMatrix,
        modelMatrix       : this.floorModelMatrix,
        depthMap          : this.depthMap,
        ambientColor      : [0.0, 0.0, 0.0, 0.0],
        diffuseColor      : [1.0, 1.0, 1.0, 1.0],
        lightPos          : this.lightPos,
        wrap              : 0,
        lightNear         : this.lightNear,
        lightFar          : this.lightFar,
        lightViewMatrix   : this.lightViewMatrix,
        lightProjectionMatrix: this.lightProjectionMatrix
      },
      renderState: {
        depthTest: true
      }
    });

    this.bunnyDrawCmd = new DrawCommand({
      vertexArray: this.bunnyMesh,
      program: this.drawShadowMappedProgram,
      uniforms: {
        projectionMatrix  : this.camProjectionMatrix,
        viewMatrix        : this.viewMatrix,
        modelMatrix       : this.bunnyModelMatrix,
        depthMap          : this.depthMap,
        ambientColor      : [0.3, 0.3, 0.3, 1.0],
        diffuseColor      : [1.0, 1.0, 1.0, 1.0],
        lightPos          : this.lightPos,
        wrap              : 0,
        lightNear         : this.lightNear,
        lightFar          : this.lightFar,
        lightViewMatrix   : this.lightViewMatrix,
        lightProjectionMatrix: this.lightProjectionMatrix
      },
      renderState: {
        depthTest: true
      }
    });

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
  update: function() {
    Time.verbose = true;
    Time.update();

    //rotate camera
    var t = Time.seconds / 5;
    this.eye[0] = 6*Math.cos(Math.PI * t);
    this.eye[1] = 3;
    this.eye[2] = 6*Math.sin(Math.PI * t);
    lookAt(this.viewMatrix, this.eye, this.target, this.up);
  },
  draw: function() {
    var gl = this.gl;

    //FIXME: uniform leaking
    //this.floorDrawCmd.uniforms.invViewMatrix = viewMatrix.dup().invert();
    //this.floorDrawCmd.uniforms.normalMatrix = viewMatrix.dup().invert().transpose();
    //this.bunnyDrawCmd.uniforms.invViewMatrix = viewMatrix.dup().invert();
    //this.bunnyDrawCmd.uniforms.normalMatrix = viewMatrix.dup().invert().transpose();

    this.commands.forEach(function(cmd) {
      this.context.submit(cmd);
    }.bind(this));
    this.context.render();
  }
})
