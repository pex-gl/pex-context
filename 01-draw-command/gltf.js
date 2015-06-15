//utils
var debug           = require('debug').enable('pex/gltf pex/gltf-app pex/glu/VertexBuffer pex/glu/VertexArray');
var log             = require('debug')('pex/gltf-app');
var extend          = require('extend');

//sys
var createWindow    = require('./sys/createWindow');
var loadImage       = require('./sys/loadImage');
var Time            = require('./sys/Time');
var loadDDSCubemap  = require('./sys/loadDDSCubemap');
var Platform        = require('./sys/Platform');

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
var createBox       = require('./agen/createBox');
//var computeNormals  = require('./geom/op/compute-normals');
var subdivide       = require('./geom/op/subdivide');
var triangulate     = require('./geom/op/triangulate');
var toFlatGeometry  = require('./geom/op/to-flat-geometry');
var scale           = require('./geom/op/scale');
var bunny           = require('bunny');
var torus           = require('torus-mesh')();
var normals         = require('normals');
var rescaleVertices = require('rescale-vertices');
var SimplexNoise    = require('simplex-noise');

//math
var createMat4      = require('gl-mat4/create');
var lookAt          = require('gl-mat4/lookAt');
var perspective     = require('gl-mat4/perspective');
var translate       = require('gl-mat4/translate');
var rotateY         = require('gl-mat4/rotateY');
var copy3           = require('gl-vec3/copy');

//shaders
var glslify         = require('glslify-promise');

var loadGLTF        = require('./gltf/load.js');

var forEachKeyValue = require('./util/for-each-key-value');

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
    ShowNormalsVert: glslify(__dirname + '/sh/materials/ShowNormals.vert'),
    ShowNormalsFrag: glslify(__dirname + '/sh/materials/ShowNormals.frag')
  },
  init: function() {
      try {
        this.framerate(60);
        this.initMeshes();
        this.initResources();
        this.initCommands();
        this.loadGLTF();
        this.on('resize', this.onResize.bind(this));
      }
      catch(e) {
        console.log(e.stack);
      }
  },
  initMeshes: function() {
    var gl = this.gl;

    var targetBounds = [
      [-1, -1, -1],
      [ 1,  1,  1]
    ];

    var box = createBox(2, 2, 2);
    box = triangulate(box.position, box.indices);
    box = toFlatGeometry(box.position, box.indices);
    box.normal = normals.vertexNormals(box.indices, box.position);
    this.boxMesh = toVertexArray(gl, box);
  },
  initResources: function() {
    var gl          = this.gl;
    this.context    = new Context(gl);
    this.eye        = [4, 2, 4];
    this.target     = [0, 0, 0];
    this.up         = [0, 1, 0];

    this.camProjectionMatrix   = perspective(createMat4(), Math.PI/4, this.width/this.height, 0.1, 100);
    this.viewMatrix            = lookAt(createMat4(), this.eye, this.target, this.up);
    this.boxModelMatrix        = createMat4();

    this.showNormalsProgram = new Program(gl, this.resources.ShowNormalsVert, this.resources.ShowNormalsFrag);
  },
  initCommands: function() {
    this.commands = [];

    var drawRenderState = {
      depthTest: true
    };

    var drawUniforms = {
      projectionMatrix  : this.camProjectionMatrix,
      viewMatrix        : this.viewMatrix
    };

    var drawBoxUniforms = extend({
      modelMatrix       : this.boxModelMatrix
    }, drawUniforms);

    this.clearCmd = new ClearCommand({
      color: [0.2, 0.2, 0.2, 1.0],
      depth: true
    });

    //this.boxDrawCmd = new DrawCommand({
    //  vertexArray : this.boxMesh,
    //  program     : this.showNormalsProgram,
    //  uniforms    : drawBoxUniforms,
    //  renderState : drawRenderState
    //});

    this.commands.push(this.clearCmd);
    //this.commands.push(this.boxDrawCmd);
  },
  loadGLTF: function() {
    var gl = this.gl;
    var commands = this.commands;
    var showNormalsProgram = this.showNormalsProgram;
    var projectionMatrix = this.camProjectionMatrix;
    var viewMatrix = this.viewMatrix;
    var modelMatrix = this.boxModelMatrix;

    //loadGLTF(gl, __dirname + '/assets/gltf/duck/duck.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/wine/wine.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/SuperMurdoch/SuperMurdoch.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/rambler/Rambler.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/box/box.gltf', function(err, json) {
      log('load done', 'err:', err, '' + json);

      var AttributeNameMap = {
        "NORMAL": "normal",
        "POSITION": "position",
        "TEXCOORD_0": "texCoord"
      }

      log('buildMesh AttributeNameMap');

      var AttributeSizeMap = {
        "SCALAR": 1,
        "VEC3": 3,
        "VEC2": 2
      }

      function buildBufferInfo(accessorName) {
        var accessorInfo = json.accessors[accessorName];
        var bufferInfo = {
          data: json.bufferViews[accessorInfo.bufferView].typedArray,
          opts: {
            offset: accessorInfo.byteOffset,
            stride: accessorInfo.byteStride,
            size: AttributeSizeMap[accessorInfo.type]
          }
        };
        return bufferInfo;
      }

      log('buildMesh');
      forEachKeyValue(json.meshes, function(meshName, meshInfo) {
        log('buildMesh', meshName);
        meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
          log('buildPrimitive', primitiveIndex);

          var va = new VertexArray(gl);

          forEachKeyValue(primitiveInfo.attributes, function(attributeSemantic, accessorName) {
            var attributeInfo = buildBufferInfo(accessorName);
            var attributeName = AttributeNameMap[attributeSemantic];
            log('buildAttribute', attributeName, attributeInfo.opts);
            va.addAttribute(attributeName, attributeInfo.data, attributeInfo.opts);
          });

          var indexBufferInfo = buildBufferInfo(primitiveInfo.indices);
          log('buildIndexBuffer', indexBufferInfo.opts, 'len:', indexBufferInfo.data.length);
          va.addIndexBuffer(indexBufferInfo.data, indexBufferInfo.opts);

          var modelMatrix = createMat4();
          rotateY(modelMatrix, modelMatrix, Math.PI/2);

          var cmd = new DrawCommand({
            vertexArray : va,
            program     : showNormalsProgram,
            uniforms    : {
              projectionMatrix: projectionMatrix,
              viewMatrix: viewMatrix,
              modelMatrix: modelMatrix
            },
            renderState : {
              depthTest: true
            }
          });
          commands.push(cmd);
        });
      });
    });
  },
  onResize: function(e) {
    perspective(this.camProjectionMatrix, Math.PI/4, this.width/this.height, 0.1, 100);
  },
  update: function() {
    Time.verbose = true;
    Time.update();
  },
  draw: function() {
    var gl = this.gl;

    this.commands.forEach(function(cmd) {
      if (cmd.uniforms && cmd.uniforms.modelMatrix) {
        rotateY(cmd.uniforms.modelMatrix, cmd.uniforms.modelMatrix, Math.PI/2/50);
      }
      this.context.submit(cmd);
    }.bind(this));

    try {
      this.context.render();
    }
    catch(e) {
      console.log(e);
      console.log(e.stack)
    }
  }
})
