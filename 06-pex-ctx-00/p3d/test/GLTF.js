var debug = require('debug').enable('-')
var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Mat3 = require('../../math/Mat3');
var Vec3 = require('../../math/Vec3');
var loadGLTF = require('../../load-gltf');
var log = require('debug')('example/GLTF');

var VERT_SRC = '\
attribute vec3 aPosition; \
attribute vec3 aColor; \
varying vec3 vColor; \
uniform mat4 uProjectionMatrix;\
uniform mat4 uViewMatrix;\
uniform mat4 uModelMatrix;\
void main() { \
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0); \
    vColor = aColor; \
} \
';

var FRAG_SRC = '\
varying vec3 vColor; \
void main() { \
    gl_FragColor = vec4(vColor, 1.0); \
} \
';

if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
}

var ASSETS_PATH = Platform.isBrowser ? 'assets' : __dirname + '/assets';

function forEachKeyValue(obj, cb) {
    var index = 0;
    Object.keys(obj).forEach(function(key) {
        cb(key, obj[key], index++);
    })
}



Window.create({
    settings: {
        width: 800,
        height: 600,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();

        loadGLTF(ctx, ASSETS_PATH + '/gltf/duck/duck.gltf', this.onSceneLoaded.bind(this));
        //loadGLTF(ctx, ASSETS_PATH + '/gltf/rambler/rambler.gltf', this.onSceneLoaded.bind(this));
        //loadGLTF(ctx, ASSETS_PATH + '/gltf/SuperMurdoch/SuperMurdoch.gltf', this.onSceneLoaded.bind(this));

        this.projectionMatrix = Mat4.perspective(Mat4.create(), 60, this.width/this.height, 0.1, 100);
        this.viewMatrix       = Mat4.create();
        this._tempModelViewMatrix = Mat4.create();;

        this.t = 0;

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this.projectionMatrix);
    },
    prepareUniforms: function(json, instanceProgramInfo, parameters, instanceValues) {
        //FIXME: getting gl context -> ugly!
        var ctx = this.getContext();
        var gl = ctx.getGL();

        var uniforms = {};
        forEachKeyValue(instanceProgramInfo.uniforms, function(uniformName, valueName) {
            var parameter = parameters[valueName];
            var value = instanceValues[valueName] || parameter.value;
            uniforms[uniformName] = null;
            if (!value) {
                if (parameter.source) {
                    log('uniform source found', parameter.source);
                    //TODO: are sources refering only to node matrices?
                    value = json.nodes[parameter.source].matrix;
                }
                else if (parameter.semantic) {
                    switch(parameter.semantic) {
                        case 'MODELVIEW': value = Mat4.create(); break; //TODO: handle custom variable names in the shader
                        case 'PROJECTION': value = Mat4.create(); break; //TODO: handle custom variable names in the shader
                        case 'MODELVIEWINVERSETRANSPOSE': value = Mat3.create(); console.log('WARN', 'MODELVIEWINVERSETRANSPOSE semantic need to be implemented'); break;
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
                  case gl.SAMPLER_2D: value = json.textures[value]._texture; break; //TODO: check if this is not null (eg. texture loading failed)
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
            uniforms[uniformName] = value;
        });
        return uniforms;
    },
    onSceneLoaded: function(err, json) {
        if (err) {
            console.log(err);
            console.log(err.stack);
            return;
        }
        this.prepareScene(json);
    },
    prepareScene: function(json) {
        this.json = json;
        var self = this;
        var sceneBoundingBox = {
            min: [ Infinity,  Infinity,  Infinity],
            max: [-Infinity, -Infinity, -Infinity]
        }
        forEachKeyValue(json.meshes, function(meshName, meshInfo, meshIndex) {
            meshInfo.primitives.forEach(function(primitiveInfo, primitiveIndex) {
                //if (!primitiveInfo.vertexArray) return; //FIXME: TEMP!

                var materialInfo = json.materials[primitiveInfo.material];
                var instanceValues = materialInfo.instanceTechnique.values;
                var techniqueInfo = json.techniques[materialInfo.instanceTechnique.technique];
                var parameters = techniqueInfo.parameters;
                var defaultPass = techniqueInfo.passes.defaultPass;
                var instanceProgramInfo = defaultPass.instanceProgram;
                var program = json.programs[instanceProgramInfo.program]._program;

                var localModelViewMatrix = Mat4.create();

                var uniforms = self.prepareUniforms(json, instanceProgramInfo, parameters, instanceValues)

                meshInfo._renderInfo = {
                    vertexArray : primitiveInfo.vertexArray,
                    program     : program,
                    uniforms    : uniforms
                }

                meshInfo.primitives.forEach(function(primitiveInfo) {
                    var posAccessor = json.accessors[primitiveInfo.attributes.POSITION];
                    sceneBoundingBox.min[0] = Math.min(sceneBoundingBox.min[0], posAccessor.min[0]);
                    sceneBoundingBox.min[1] = Math.min(sceneBoundingBox.min[1], posAccessor.min[1]);
                    sceneBoundingBox.min[2] = Math.min(sceneBoundingBox.min[2], posAccessor.min[2]);
                    sceneBoundingBox.max[0] = Math.max(sceneBoundingBox.max[0], posAccessor.max[0]);
                    sceneBoundingBox.max[1] = Math.max(sceneBoundingBox.max[1], posAccessor.max[1]);
                    sceneBoundingBox.max[2] = Math.max(sceneBoundingBox.max[2], posAccessor.max[2]);
                })
            });
        });

        var sceneCenter = Vec3.create();
        Vec3.add(sceneCenter, sceneBoundingBox.min);
        Vec3.add(sceneCenter, sceneBoundingBox.max);
        Vec3.scale(sceneCenter, 0.5);
        var sceneSize = Vec3.sub(Vec3.copy(sceneBoundingBox.max), sceneBoundingBox.min);
        var sceneMaxSize = Math.max(sceneSize[0], Math.max(sceneSize[1], sceneSize[2]));

        var camPos = Vec3.create();
        Vec3.set(camPos, sceneCenter);
        camPos[2] += sceneMaxSize * 2;

        Mat4.lookAt(this.viewMatrix, camPos, sceneCenter, Vec3.yAxis());

        //TODO: get main camera name from scene
        //FIXME: giving up on gltf camera for now
        //get first camera
        //var mainCameraName = Object.keys(json.cameras)[0];
        //var camera = json.cameras[mainCameraName];
        //var perspective = camera.perspective;
        //var yfov = perspective.yfov;
        //var znear = perspective.znear;
        //var zfar = perspective.zfar;
        //var aspectRatio = this.getAspectRatio();
        //this.projectionMatrix = Mat4.perspective(Mat4.create(), yfov, aspectRatio, znear, zfar);
        //var cameraNode = Object.keys(json.nodes).filter(function(nodeName) {
        //    var node = json.nodes[nodeName];
        //    if (node.camera == mainCameraName) {
        //        //this.viewMatrix = node.matrix;
        //    }
        //}.bind(this))
    },
    drawNodes: function(ctx, json, nodes) {
        var projectionMatrix = this.projectionMatrix;
        var viewMatrix = this.viewMatrix;
        var modelMatrix = ctx.getModelMatrix();
        var modelViewMatrix = this._tempModelViewMatrix;
        //FIXME: change to for loops
        nodes.forEach(function(nodeName) {
            var node = json.nodes[nodeName];
            if (!node.meshes) {
                //skip camera and lights
                return;
            }
            node.meshes.forEach(function(meshName) {
                var meshInfo = json.meshes[meshName];
                var vao = meshInfo._renderInfo.vertexArray;
                var program = meshInfo._renderInfo.program;
                var uniforms = meshInfo._renderInfo.uniforms;
                ctx.bindVertexArray(vao);
                ctx.bindProgram(program);
                forEachKeyValue(uniforms, function(name, value) {
                    program.setUniform(name, value);
                })

                program.setUniform('u_projectionMatrix', projectionMatrix);

                Mat4.set(modelViewMatrix, viewMatrix);
                Mat4.mult(modelViewMatrix, modelMatrix);
                program.setUniform('u_modelViewMatrix', modelViewMatrix);

                ctx.draw(ctx.TRIANGLES, 0, vao.getIndexBuffer().getLength());
            })
        })
    },
    draw: function() {
        var ctx = this.getContext();
        var time = this.t;

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        //ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
        //        Math.cos(time * Math.PI) * 5,
        //        Math.sin(time * 0.5) * 4,
        //        Math.sin(time * Math.PI) * 5,
        //        0,0,0,0,1,0
        //    )
        //);

        if (this.json) {
            var rootNodes = this.json.scenes[this.json.scene].nodes;
            this.drawNodes(ctx, this.json, rootNodes);
        }

        this.t += 1 / 60;
    }
});
