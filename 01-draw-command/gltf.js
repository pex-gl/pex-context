//utils
var debug           = require('debug').enable('pex/gltf-app -pex/gltf');
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
var mult44          = require('gl-mat4/multiply');
var copy44          = require('gl-mat4/copy');
var scale44         = require('gl-mat4/scale');
var invert          = require('gl-mat4/invert');
var transpose       = require('gl-mat4/transpose');
var scale44         = require('gl-mat4/scale');
var copy3           = require('gl-vec3/copy');
var sub3            = require('gl-vec3/subtract');

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
    this.eye        = [14, 12, 14];
    this.target     = [0, 0, 0];
    this.up         = [0, 1, 0];

    this.camProjectionMatrix   = perspective(createMat4(), Math.PI/4, this.width/this.height, 0.1, 500);
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
    var modelViewMatrix = mult44(createMat4(), viewMatrix, modelMatrix);
    var normalMatrix = createMat4();
    invert(normalMatrix, modelViewMatrix);
    transpose(normalMatrix, normalMatrix);
    normalMatrix = [
      normalMatrix[0], normalMatrix[1], normalMatrix[2],
      normalMatrix[4], normalMatrix[5], normalMatrix[6],
      normalMatrix[8], normalMatrix[9], normalMatrix[10]
    ];

    //loadGLTF(gl, __dirname + '/assets/model/box/box.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/duck/duck.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/wine/wine.gltf', function(err, json) {
    //loadGLTF(gl, __dirname + '/assets/model/SuperMurdoch/SuperMurdoch.gltf', function(err, json) {
    loadGLTF(gl, __dirname + '/assets/model/rambler/Rambler.gltf', function(err, json) {
      if (err) {
        log('load done', 'err:', err);
      }
      else {
        log('load done',  '' + json);
      }

      var bbox = {
        min: [Infinity, Infinity, Infinity],
        max: [-Infinity, -Infinity, -Infinity]
      };

      log('buildMesh');
      forEachKeyValue(json.meshes, function(meshName, meshInfo, meshIndex) {
        meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
          if (!primitiveInfo.vertexArray) return; //FIXME: TEMP!

          var materialInfo = json.materials[primitiveInfo.material];
          var instanceValues = materialInfo.instanceTechnique.values;
          var techniqueInfo = json.techniques[materialInfo.instanceTechnique.technique];
          var parameters = techniqueInfo.parameters;
          var defaultPass = techniqueInfo.passes.defaultPass;
          var instanceProgramInfo = defaultPass.instanceProgram;
          var program = json.programs[instanceProgramInfo.program]._program;

          var uniforms = {};
          var localModelViewMatrix = createMat4();

          //projectionMatrix: projectionMatrix,
          //viewMatrix: viewMatrix,
          //modelMatrix: modelMatrix

          forEachKeyValue(instanceProgramInfo.uniforms, function(uniformName, valueName) {
            var parameter = parameters[valueName];
            var value = instanceValues[valueName] || parameter.value;
            uniforms[valueName] = null;
            //log('uniform', uniformName, valueName, value, parameter);
            if (!value) {
              if (parameter.source) {
                  log('uniform source found', parameter.source);  //TODO: uniform source
                  //TODO: is source refering only to node matrices?
                  value = json.nodes[parameter.source].matrix;
              }
              else if (parameter.semantic) {
                switch(parameter.semantic) {
                  case 'MODELVIEW':
                    copy44(localModelViewMatrix, modelViewMatrix);
                    value = localModelViewMatrix;
                    break;
                  case 'PROJECTION':
                    value = projectionMatrix;
                    break;
                  case 'MODELVIEWINVERSETRANSPOSE':
                    value = normalMatrix;
                    break;
                  default:
                    throw new Error('Unknown uniform semantic found ' + parameter.semantic);
                }
              }
              else {
                throw new Error('No value for uniform:' + valueName);
              }
            }
            if (instanceValues[valueName]) {
              switch(parameters[valueName].type) {
                case gl.SAMPLER_2D:
                  value = json.textures[value]._texture;//TODO: check if this is not null (eg. texture loading failed)
                  break;
                case gl.FLOAT_VEC2: break;
                case gl.FLOAT_VEC3: break;
                case gl.FLOAT_VEC4: break;
                case gl.FLOAT_MAT4: break;
                case gl.FLOAT: break;
                default:
                  throw new Error('Unknown uniform type:' + parameters[valueName].type);
              }
            }

            if (value === null || value === undefined) {
              throw new Error('Uniform ' + valueName + ' is missing');
            }
            uniforms[valueName] = value;
          });

          //program = showNormalsProgram;

          forEachKeyValue(uniforms, function(name, value) {
            uniforms['u_' + name] = value;
            delete uniforms[name];
          })

          var positions = primitiveInfo.vertexArray.attributes['position'].dataBuf;
          for(var i=0; i<positions.length; i+=3) {
            for(var j=0; j<3; j++) {
              bbox.min[j] = Math.min(bbox.min[j], positions[i+j]);
              bbox.max[j] = Math.max(bbox.max[j], positions[i+j]);
            }
          }

          meshInfo._cmd = {
            vertexArray : primitiveInfo.vertexArray,
            program     : program,
            uniforms    : uniforms,
            renderState : {
              depthTest: true
            },
            bbox: bbox
          }

          //var cmd = new DrawCommand({
          //  vertexArray : primitiveInfo.vertexArray,
          //  program     : program,
          //  uniforms    : uniforms,
          //  renderState : {
          //    depthTest: true
          //  }
          //});
          //commands.push(cmd);
        });
      });

      forEachKeyValue(json.nodes, function(nodeName, nodeInfo, nodeIndex) {
        var localMatrix = createMat4();
        scale44(localMatrix, localMatrix, [2, -2, 2])
        translate(localMatrix, localMatrix, [-2, 0, 0])
        var matrixStack = [nodeInfo.matrix];
        var parent = nodeInfo.parent;
        while(parent) {
          if (parent.matrix) {
            matrixStack.unshift(parent.matrix);
          }
          parent = parent.parent;
        }
        matrixStack.forEach(function(mat) {
          mult44(localMatrix, localMatrix, mat);
        })
        if (nodeInfo.meshes) {
          nodeInfo.meshes.forEach(function(meshId) {
            var mesh = json.meshes[meshId];
            var cmd = new DrawCommand(mesh._cmd);
            mult44(cmd.uniforms.u_modelViewMatrix, cmd.uniforms.u_modelViewMatrix, localMatrix);
            commands.push(cmd);
          })
        }
      });

      var size = sub3([0,0,0], bbox.max, bbox.min);
      var maxScale = Math.max(size[0], Math.max(size[1], size[2]))
      //console.log(maxScale)
      //maxScale = 0.05;
      var tmp = createMat4();
      commands.forEach(function(cmd, cmdIndex) {
        if (!cmd.uniforms) return;
        //translate(cmd.uniforms.u_modelViewMatrix, cmd.uniforms.u_modelViewMatrix, [-size[0]/2, -size[1]/2, -size[2]/2]);
        //translate(cmd.uniforms.u_modelViewMatrix, cmd.uniforms.u_modelViewMatrix, [-0.1, 0, 0]);
        //scale44(cmd.uniforms.u_modelViewMatrix, cmd.uniforms.u_modelViewMatrix, [1/maxScale, 1/maxScale,1/maxScale]);
        //console.log('cmd', cmdIndex, cmd.vertexArray.indexBuffer.dataBuf.length)
      })
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
      if (cmd.uniforms && cmd.uniforms.u_modelViewMatrix) {
        //rotateY(cmd.uniforms.u_modelViewMatrix, cmd.uniforms.u_modelViewMatrix, Math.PI/2/50);
      }
      this.context.submit(cmd);
    }.bind(this));

    try {
      //gl.finish();
      //console.time('render');
      this.context.render();
      //gl.finish();
      //console.timeEnd('render');
    }
    catch(e) {
      console.log(e);
      console.log(e.stack)
    }
  }
})
