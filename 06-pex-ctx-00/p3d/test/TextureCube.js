var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../../p3d/Program');
var Mat3 = require('../../math/Mat3');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');
var torus = require('torus-mesh')({ majorRadius: 1, minorRadius: 0.5 });
var skybox = require('../../utils/primitive-cube')(50, 50, 50);
var R = require('ramda');
var loadCubemapHStrip = require('../../utils/load-cubemap-hstrip');

var SKYBOX_VERT_SRC = ' \
attribute vec4 aPosition; \
uniform mat4 uProjectionMatrix; \
uniform mat4 uViewMatrix; \
uniform mat4 uModelMatrix; \
varying vec3 vNormal; \
void main() { \
  vNormal = aPosition.xyz; \
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition; \
  gl_PointSize = 1.0; \
}';

var SKYBOX_FRAG_SRC = ' \
varying vec3 vNormal; \
uniform samplerCube uEnvMap; \
void main() { \
  gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0); \
  gl_FragColor = textureCube(uEnvMap, normalize(vNormal)); \
}';

var REFLECTION_VERT_SRC = ' \
attribute vec2 aTexCoord0; \
attribute vec3 aNormal; \
attribute vec4 aPosition; \
uniform mat4 uProjectionMatrix; \
uniform mat4 uViewMatrix; \
uniform mat4 uModelMatrix; \
uniform mat3 uNormalMatrix; \
varying vec3 ecNormal; \
varying vec3 ecPosition; \
varying vec2 vTexCoord0; \
void main() { \
  vTexCoord0 = aTexCoord0; \
  ecNormal = uNormalMatrix * aNormal; \
  vec4 ecPos = uViewMatrix * uModelMatrix * aPosition; \
  ecPosition = ecPos.xyz; \
  gl_Position = uProjectionMatrix * ecPos; \
  gl_PointSize = 1.0; \
}';

var REFLECTION_FRAG_SRC = ' \
varying vec2 vTexCoord0; \
varying vec3 ecNormal; \
varying vec3 ecPosition; \
uniform sampler2D uAlbedoMap; \
uniform samplerCube uEnvMap; \
uniform mat4 uInvViewMatrix; \
uniform vec2 uRepeat; \
void main() { \
  gl_FragColor = texture2D(uAlbedoMap, vTexCoord0 * uRepeat); \
  /* all calculation in eye / camera space, doing it in world space would save some trouble but would require wcCamPos */ \
  /* incident vector */ \
  vec3 I = normalize(ecPosition); \
  /* surface normal */ \
  vec3 N = normalize(ecNormal); \
  vec3 ecReflection = reflect(I, N); \
  /* w = 0 because we are transforming direction, not position */ \
  vec3 wcReflection = vec3(uInvViewMatrix * vec4(ecReflection, 0.0)); \
  gl_FragColor = textureCube(uEnvMap, wcReflection); \
}';

if (Platform.isBrowser) {
    SKYBOX_FRAG_SRC = 'precision highp float; \n' + SKYBOX_FRAG_SRC;
    REFLECTION_FRAG_SRC = 'precision highp float; \n' + REFLECTION_FRAG_SRC;
}

function vaoFromMesh(ctx, mesh) {
    var attributes = [];
    var indexBuffer = null;

    if (mesh.positions) {
        var buf  = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(mesh.positions)));
        attributes.push({ buffer: buf, location: ctx.ATTRIB_POSITION, size: 3 });
    }

    if (mesh.uvs) {
        var buf  = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(mesh.uvs)));
        attributes.push({ buffer: buf, location: ctx.ATTRIB_TEX_COORD_0, size: 2 });
    }

    if (mesh.normals) {
        var buf  = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(mesh.normals)));
        attributes.push({ buffer: buf, location: ctx.ATTRIB_NORMAL, size: 3 });
    }

    if (mesh.colors) {
        var buf  = ctx.createBuffer(ctx.ARRAY_BUFFER, new Float32Array(R.flatten(mesh.colors)));
        attributes.push({ buffer: buf, location: ctx.ATTRIB_COLOR, size: 4 });
    }

    if (mesh.cells) {
        indexBuffer  = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(R.flatten(mesh.cells)));
    }

    return ctx.createVertexArray(attributes, indexBuffer);
}

Window.create({
    settings: {
        type: '3d',
        width: 1280,
        height: 720
    },
    init: function() {
        var ctx = this.getContext();

        this.modelMatrix = Mat4.create();
        this.projectionMatrix = Mat4.perspective(Mat4.create(), 90, this.getAspectRatio()/2, 0.01, 100.0);
        this.viewMatrix = Mat4.lookAt([], [4, 3, 4], [0, 0, 0], [0, 1, 0]);
        this.invViewMatrix = Mat4.lookAt([], [4, 3, 4], [0, 0, 0], [0, 1, 0]);
        this.normalMatrixTemp4 = Mat4.create();
        this.normalMatrix = Mat3.create();

        this.skyboxProgram = ctx.createProgram(SKYBOX_VERT_SRC, SKYBOX_FRAG_SRC);
        ctx.bindProgram(this.skyboxProgram);
        this.skyboxProgram.setUniform('uEnvMap', 1);

        this.reflectionProgram = ctx.createProgram(REFLECTION_VERT_SRC, REFLECTION_FRAG_SRC);
        ctx.bindProgram(this.reflectionProgram);
        this.reflectionProgram.setUniform('uRepeat', [ 8, 8 ]);
        this.reflectionProgram.setUniform('uAlbedoMap', 0);
        this.reflectionProgram.setUniform('uEnvMap', 1);

        this.torusVao = vaoFromMesh(ctx, torus);
        this.skyboxVao = vaoFromMesh(ctx, skybox);

        var img = new Uint8Array(R.flatten([
            [0xff, 0xff, 0xff, 0xff], [0xcc, 0xcc, 0xcc, 0xff],
            [0xcc, 0xcc, 0xcc, 0xff], [0xff, 0xff, 0xff, 0xff]
        ]));

        this.albedoMap = ctx.createTexture2D(img, 2, 2, {
          repeat: true,
          minFilter: ctx.NEAREST,
          magFilter: ctx.NEAREST
        })

        var assetsPath = Platform.isBrowser ? 'assets' : __dirname + '/assets';

        loadCubemapHStrip(assetsPath + '/cubemaps/Hamarikyu_Bridge_hstrip_400.jpg', function(err, images) {
            this.envMap1 = ctx.createTextureCube(images);
        }.bind(this));
        loadCubemapHStrip(assetsPath + '/cubemaps/Hamarikyu_Bridge_irr_hstrip.jpg', function(err, images) {
            this.envMap2 = ctx.createTextureCube(images);
        }.bind(this));
    },
    seconds: 0,
    prevTime: Date.now(),
    draw: function() {
        var now = Date.now();
        this.seconds += (now - this.prevTime)/1000;
        this.prevTime = now;

        var ctx = this.getContext();
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
        ctx.setDepthTest(true);

        var speed = 0.1;

        //Start facing towards -Z, and rotate towards +X
        var rot = Math.PI/2 + speed * this.seconds * Math.PI * 2.0;
        ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                Math.cos(rot) * 5,
                1,
                Math.sin(rot) * 5,
                0,0,0,0,1,0
            )
        );

        //FIXME: the moment you have uProjectionMatrix in you shader this is REQUIRED, otherwise Context will override your manual settings
        ctx.setProjectionMatrix(this.projectionMatrix);
        ctx.setViewMatrix(this.viewMatrix);
        ctx.setModelMatrix(this.modelMatrix);
        //This is not required anymore, Context will handle it
        //this.program.setUniform('uViewMatrix', this.view);

        Mat4.set(this.invViewMatrix, this.viewMatrix);
        Mat4.invert(this.invViewMatrix);

        Mat4.set(this.normalMatrixTemp4, this.viewMatrix);
        Mat4.mult(this.normalMatrixTemp4, this.modelMatrix);
        Mat4.invert(this.normalMatrixTemp4);
        Mat4.transpose(this.normalMatrixTemp4);
        Mat3.fromMat4(this.normalMatrix, this.normalMatrixTemp4);

        ctx.bindTexture(this.albedoMap, 0);
        ctx.bindProgram(this.reflectionProgram);
        this.reflectionProgram.setUniform('uNormalMatrix', this.normalMatrix);
        this.reflectionProgram.setUniform('uInvViewMatrix', this.invViewMatrix);

        ctx.pushState(ctx.VIEWPORT_BIT);

        ctx.setViewport(0, 0, this.getWidth()/2, this.getHeight());
        ctx.bindTexture(this.envMap1, 1);
        ctx.bindVertexArray(this.torusVao);
        ctx.draw(ctx.TRIANGLES, 0, this.torusVao.getIndexBuffer().getLength())
        ctx.bindProgram(this.skyboxProgram);
        ctx.bindVertexArray(this.skyboxVao);
        ctx.draw(ctx.TRIANGLES, 0, this.skyboxVao.getIndexBuffer().getLength())

        ctx.setViewport(this.getWidth()/2, 0, this.getWidth()/2, this.getHeight());
        ctx.bindTexture(this.envMap2, 1);
        ctx.bindVertexArray(this.torusVao);
        ctx.draw(ctx.TRIANGLES, 0, this.torusVao.getIndexBuffer().getLength());
        ctx.bindProgram(this.skyboxProgram);
        ctx.bindVertexArray(this.skyboxVao);
        ctx.draw(ctx.TRIANGLES, 0, this.skyboxVao.getIndexBuffer().getLength());

        ctx.popState(ctx.VIEWPORT_BIT);
    }
})
