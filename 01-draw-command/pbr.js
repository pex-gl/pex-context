var createWindow = require('./sys/createWindow');

var Program      = require('./glu/Program');
var VertexArray  = require('./glu/VertexArray');
var Context      = require('./glu/Context');
var ClearCommand = require('./glu/ClearCommand');
var DrawCommand  = require('./glu/DrawCommand');
var TextureCube  = require('./glu/TextureCube');
var Vec3         = require('./geom/Vec3');
var Mat4         = require('./geom/Mat4');
var torus        = require('torus-mesh')();
var createCube   = require('./vgen/createCube');
var bunny        = require('bunny');
var normals      = require('normals');
var rescaleVertices = require('rescale-vertices');
var glslify      = require('glslify-promise');
var loadImage    = require('./sys/loadImage');
var Time         = require('./sys/Time');
var Platform         = require('./sys/Platform');
var loadDDSCubemap = require('./sys/loadDDSCubemap');
//var PBRProgram   = require('pex-shaders').PBRProgram;

var targetBounds = [
  [-1, -1, -1],
  [ 1,  1,  1]
];

var ASSETS_PATH = Platform.isBrowser ? 'assets' : __dirname + '/assets'

//Scene.prototype = Object.create(events.EventEmitter.prototype)

createWindow({
  settings: {
    width: 1280,
    height: 720,
    multisample: true,
    fullscreen: Platform.isBrowser
  },
  //Problems with preloading resources
  //-might need gl context
  //-loading files one by one is pita
  resources: {
    showNormalsVert: { type: 'text', uri:glslify(__dirname + '/sh/materials/ShowNormals.vert') },
    showNormalsFrag: glslify(__dirname + '/sh/materials/ShowNormals.frag'),
    skyboxVert: glslify(__dirname + '/sh/materials/Skybox.vert'),
    skyboxFrag: glslify(__dirname + '/sh/materials/Skybox.frag'),
    pbrVert: glslify(__dirname + '/sh/materials/PBR.vert'),
    pbrFrag: glslify(__dirname + '/sh/materials/PBR.frag')
  },
  init: function() {
    console.log('int');
    this.framerate(60);

    var gl = this.gl;

    if (Platform.isBrowser) {
      this.lodExt = this.gl.getExtension('EXT_shader_texture_lod');
    }

    this.context = new Context(gl);

    this.timeStart = Date.now();
    this.eye = new Vec3(4, 0, 4);
    this.target = new Vec3(0, 0, 0);
    this.up = new Vec3(0, 1, 0);

    this.projectionMatrix = new Mat4().perspective(60, this.width/this.height, 0.1, 100).toArray();

    this.torusMesh = new VertexArray(gl);
    this.torusMesh.addAttribute('position', torus.positions, { size: 3 });
    this.torusMesh.addAttribute('normal', torus.normals, { size: 3 });
    this.torusMesh.addAttribute('texCoord', torus.uvs, { size: 2 });
    this.torusMesh.addIndexBuffer(torus.cells);

    this.commands = [];

    this.clearCmd = new ClearCommand({
      color: [0.2, 0.2, 0.2, 1.0],
      depth: true
    });
    this.commands.push(this.clearCmd);

    this.bunnyMesh = new VertexArray(gl);
    this.bunnyMesh.addAttribute('position', rescaleVertices(bunny.positions, targetBounds), { size: 3 });
    this.bunnyMesh.addAttribute('normal', normals.vertexNormals(bunny.cells, bunny.positions), { size: 3 });
    this.bunnyMesh.addIndexBuffer(bunny.cells);

    //
    //this.skyBoxTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/ForestIrradiance.dds');
    //this.skyBoxTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/output_pmrem.dds');
    //this.skyBoxTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/park_skybox32f.dds');
    this.skyBoxTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/park_irr32f.dds');
    this.reflectionTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/park_pmrem32f.dds');
    //this.reflectionTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/output_pmrem.dds');
    //this.reflectionTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/output_cubemap_rgb8_prem.dds');
    //this.skyBoxTexture = loadDDSCubemap(gl, ASSETS_PATH + '/cubemaps/pmrem_dds/output_iem.dds');

    //
    try {
      this.bunnyProgram = new Program(gl, this.resources.pbrVert, this.resources.pbrFrag);
      //this.bunnyProgram = new Program(gl, this.resources.showNormalsVert, this.resources.showNormalsFrag);
    }
    catch(e) {
      console.log(e.stack);
    }
    this.bunnyDrawCmd = new DrawCommand({
      vertexArray: this.bunnyMesh,
      program: this.bunnyProgram,
      uniforms: {
        projectionMatrix  : this.projectionMatrix,
        modelMatrix       : new Mat4().toArray(),
        texture           : this.reflectionTexture
      },
      renderState: {
        depthTest: {
          enabled: true
        }
      }
    });
    this.commands.push(this.bunnyDrawCmd);

    try {
      this.skyboxProgram = new Program(gl, this.resources.skyboxVert, this.resources.skyboxFrag);
      //this.skyboxProgram = new Program(gl, this.resources.showNormalsVert, this.resources.showNormalsFrag);
    }
    catch(e) {
      console.log(e);
    }
    this.skyBoxMesh = createCube(this.gl, 50);
    this.skyBoxDrawCmd = new DrawCommand({
      vertexArray: this.skyBoxMesh,
      program: this.skyboxProgram,
      uniforms: {
        projectionMatrix: this.projectionMatrix,
        modelMatrix: new Mat4().toArray(),
        texture: this.skyBoxTexture
      },
      renderState: {
        depthTest: {
          enabled: true
        }
      }
    });
    this.commands.push(this.skyBoxDrawCmd);
  },
  draw: function() {
    Time.verbose = true;
    Time.update();

    var gl = this.gl;

    var t = (Date.now() - this.timeStart)/1000/10;
    //t = 0.5;
    this.eye.x = 4*Math.cos(Math.PI * t);
    this.eye.z = 4*Math.sin(Math.PI * t);
    var viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up);

    if (!this.bunnyDrawCmd) {
      return;
    }
    this.bunnyDrawCmd.uniforms.viewMatrix = viewMatrix.toArray();
    this.bunnyDrawCmd.uniforms.invViewMatrix = viewMatrix.dup().invert().toArray();
    this.bunnyDrawCmd.uniforms.normalMatrix = viewMatrix.dup().invert().transpose().toArray();
    this.skyBoxDrawCmd.uniforms.viewMatrix = viewMatrix.toArray();

    this.commands.forEach(function(cmd) {
      this.context.submit(cmd);
    }.bind(this));
    this.context.render();
  }
})
