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

var targetBounds = [
  [-1, -1, -1],
  [ 1,  1,  1]
];

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
    showNormalsVert: glslify(__dirname + '/sh/materials/ShowNormals.vert'),
    showNormalsFrag: glslify(__dirname + '/sh/materials/ShowNormals.frag'),
    skyboxVert: glslify(__dirname + '/sh/materials/Skybox.vert'),
    skyboxFrag: glslify(__dirname + '/sh/materials/Skybox.frag'),
    skyboxCubeMapImages: Promise.all([
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_posx.jpg'),
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_negx.jpg'),
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_posy.jpg'),
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_negy.jpg'),
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_posz.jpg'),
      loadImage(__dirname + '/assets/cubemaps/uffizi/uffizi_cross_negz.jpg')
    ])
  },
  init: function() {
    this.framerate(60);

    var gl = this.gl;

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

    this.bunnyProgram = new Program(gl, this.resources.showNormalsVert, this.resources.showNormalsFrag);
    this.bunnyDrawCmd = new DrawCommand({
      vertexArray: this.bunnyMesh,
      program: this.bunnyProgram,
      uniforms: {
        projectionMatrix: this.projectionMatrix,
        modelMatrix: new Mat4().toArray()
      },
      renderState: {
        depthTest: {
          enabled: true
        }
      }
    });
    this.commands.push(this.bunnyDrawCmd);

    this.skyBoxTexture = new TextureCube(gl, this.resources.skyboxCubeMapImages);
    this.skyboxProgram = new Program(gl, this.resources.skyboxVert, this.resources.skyboxFrag);
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
    var viewMatrix = new Mat4().lookAt(this.eye, this.target, this.up).toArray();

    this.bunnyDrawCmd.uniforms.viewMatrix = viewMatrix;
    this.skyBoxDrawCmd.uniforms.viewMatrix = viewMatrix;

    this.commands.forEach(function(cmd) {
      this.context.submit(cmd);
    }.bind(this));
    this.context.render();
  }
})
