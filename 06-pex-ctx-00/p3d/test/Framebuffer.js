var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');

var MTR_VERT_SRC = '\
attribute vec3 aPosition; \
attribute vec3 aNormal; \
attribute vec3 aColor; \
varying vec3 vColor; \
varying vec3 vNormal; \
uniform mat4 uProjectionMatrix;\
uniform mat4 uViewMatrix;\
uniform mat4 uModelMatrix;\
void main() { \
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0); \
    vColor = aColor; \
    vNormal = aNormal; \
} \
';

var MTR_FRAG_SRC = '' +
'#ifdef GL_ES\n' +
'#extension GL_EXT_draw_buffers : require\n' +
'#endif\n' +
'varying vec3 vColor;\n' +
'varying vec3 vNormal;\n' +
'void main() {\n' +
'    vec3 L = normalize(vec3(5.0, 15.0, 10.0));\n' +
'    vec3 N = normalize(vNormal);\n' +
'    float NdotL = max(0.2, dot(N, L));\n' +
'    gl_FragData[0] = vec4(vColor, 1.0);\n' +
'    gl_FragData[1] = vec4(N * 0.5 + 0.5, 1.0);\n' +
'    gl_FragData[2] = vec4(NdotL, NdotL, NdotL, 1.0);\n' +
'    gl_FragData[3] = vec4(NdotL * vColor, 1.0);\n' +
'}\n';

var DRAW_TEXTURE_VERT_SRC = '\
attribute vec2 aPosition; \
attribute vec2 aTexCoord0; \
varying vec2 vTexCoord; \
void main() { \
    gl_Position = vec4(aPosition, 0.0, 1.0); \
    vTexCoord = aTexCoord0; \
} \
';

var DRAW_TEXTURE_FRAG_SRC = '\
uniform sampler2D uTexture; \
varying vec2 vTexCoord; \
void main() { \
    gl_FragColor = texture2D(uTexture, vTexCoord); \
} \
';

if (Platform.isBrowser) {
    MTR_FRAG_SRC = 'precision highp float; \n' + MTR_FRAG_SRC;
    DRAW_TEXTURE_FRAG_SRC = 'precision highp float; \n' + DRAW_TEXTURE_FRAG_SRC;
}

Window.create({
    settings: {
        width: 800,
        height: 600,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();
        if (Platform.isBrowser) {
            var gl = ctx.getGL();
            //TODO: do extension check in the Program?
            console.log(gl.getExtension('WEBGL_draw_buffers'));
        }

        this.mrtProgram = ctx.createProgram(MTR_VERT_SRC, MTR_FRAG_SRC);
        this.drawTextureProgram = ctx.createProgram(DRAW_TEXTURE_VERT_SRC, DRAW_TEXTURE_FRAG_SRC);

        this.projectionMatrix = Mat4.perspective(Mat4.create(),45,this.getAspectRatio(),0.001,10.0);
        this.viewMatrix       = Mat4.create();

        this.t = 0;

        this.cubeVao    = this.createCube();
        this.quadVao    = this.createFullScreenQuad();

        this.colorTex   = ctx.createTexture2D(null, this.width, this.height);
        this.normalTex  = ctx.createTexture2D(null, this.width, this.height);
        this.lightTex   = ctx.createTexture2D(null, this.width, this.height);
        this.finalTex   = ctx.createTexture2D(null, this.width, this.height);
        this.depthTex   = ctx.createTexture2D(null, this.width, this.height, { format: ctx.DEPTH_COMPONENT, type: ctx.UNSIGNED_SHORT });

        this.fbo = ctx.createFramebuffer([
            { texture: this.colorTex },
            { texture: this.normalTex },
            { texture: this.lightTex },
            { texture: this.finalTex }
        ], { texture : this.depthTex });

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this.projectionMatrix);
    },
    createCube: function() {
        var ctx = this.getContext();
        var positionColorNormalBuffer = ctx.createBuffer(
            ctx.ARRAY_BUFFER,
            new Float32Array([
                 1.0, 1.0, 1.0,   1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,   0.0, 0.0, 1.0,
                -1.0, 1.0, 1.0,  -1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,   0.0, 0.0, 1.0,
                 1.0,-1.0, 1.0,   1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,   0.0, 0.0, 1.0,
                -1.0,-1.0, 1.0,  -1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,   0.0, 0.0, 1.0,

                 1.0, 1.0, 1.0,   1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,   1.0, 0.0, 0.0,
                 1.0,-1.0, 1.0,   1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,   1.0, 0.0, 0.0,
                 1.0, 1.0,-1.0,   1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,   1.0, 0.0, 0.0,
                 1.0,-1.0,-1.0,   1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,   1.0, 0.0, 0.0,

                 1.0, 1.0, 1.0,   1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,   0.0, 1.0, 0.0,
                 1.0, 1.0,-1.0,   1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,   0.0, 1.0, 0.0,
                -1.0, 1.0, 1.0,  -1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,   0.0, 1.0, 0.0,
                -1.0, 1.0,-1.0,  -1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,   0.0, 1.0, 0.0,

                 1.0, 1.0,-1.0,   1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,   0.0, 0.0,-1.0,
                 1.0,-1.0,-1.0,   1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,   0.0, 0.0,-1.0,
                -1.0, 1.0,-1.0,  -1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,   0.0, 0.0,-1.0,
                -1.0,-1.0,-1.0,  -1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,   0.0, 0.0,-1.0,

                -1.0, 1.0, 1.0,  -1.0/2+0.5, 1.0/2+0.5, 1.0/2+0.5,  -1.0, 0.0, 0.0,
                -1.0, 1.0,-1.0,  -1.0/2+0.5, 1.0/2+0.5,-1.0/2+0.5,  -1.0, 0.0, 0.0,
                -1.0,-1.0, 1.0,  -1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,  -1.0, 0.0, 0.0,
                -1.0,-1.0,-1.0,  -1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,  -1.0, 0.0, 0.0,

                 1.0,-1.0, 1.0,   1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,   0.0,-1.0, 0.0,
                -1.0,-1.0, 1.0,  -1.0/2+0.5,-1.0/2+0.5, 1.0/2+0.5,   0.0,-1.0, 0.0,
                 1.0,-1.0,-1.0,   1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,   0.0,-1.0, 0.0,
                -1.0,-1.0,-1.0,  -1.0/2+0.5,-1.0/2+0.5,-1.0/2+0.5,   0.0,-1.0, 0.0
            ]),
            ctx.STATIC_DRAW
        );

        var indexBuffer = ctx.createBuffer(
            ctx.ELEMENT_ARRAY_BUFFER,
            new Uint16Array([
                0, 1, 2, 2, 1, 3,
                4, 5, 6, 6, 5, 7,
                8, 9,10,10, 9,11,
                12,13,14,14,13,15,
                16,17,18,18,17,19,
                20,21,22,22,21,23
            ]),
            ctx.STATIC_DRAW
        );

        var attributes = [
            { buffer : positionColorNormalBuffer, location : ctx.ATTRIB_POSITION, size : 3, stride : 9 * 4, offset : 0     },
            { buffer : positionColorNormalBuffer, location : ctx.ATTRIB_COLOR,    size : 3, stride : 9 * 4, offset : 3 * 4 },
            { buffer : positionColorNormalBuffer, location : ctx.ATTRIB_NORMAL,   size : 3, stride : 9 * 4, offset : 6 * 4 }
        ];
        return ctx.createVertexArray(attributes,indexBuffer);
    },
    createFullScreenQuad: function() {
        var ctx = this.getContext();
        var indices = new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]);
        var vertices = new Float32Array([
            -1, -1,
            1, -1,
            1,  1,
            -1,  1
        ]);
        //TODO: decide on convention about texture coords and flipping
        var texCoords = new Float32Array([
            0, 1,
            1, 1,
            1, 0,
            0, 0
        ]);

        var indexBuffer = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
        var positionBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, vertices, ctx.DYNAMIC_DRAW);
        var texCoordBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, texCoords, ctx.STATIC_DRAW);
        var attributes = [
            { buffer: positionBuffer, location: ctx.ATTRIB_POSITION, size: 2, offset: 0, stride: 8 },
            { buffer: texCoordBuffer, location: ctx.ATTRIB_TEX_COORD_0, size: 2, offset: 0, stride: 8 }
        ];
        return ctx.createVertexArray(attributes, indexBuffer);
    },
    draw: function() {
        var ctx = this.getContext();
        var time = this.t;

        ctx.setClearColor(0, 0, 0, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                Math.cos(time * Math.PI) * 5,
                Math.sin(time * 0.5) * 4,
                Math.sin(time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        var scale = 0.75 + (0.5 + Math.cos(time * Math.PI * 2) * 0.5) * 0.25;

        ctx.bindFramebuffer(this.fbo);
            ctx.setViewport(0, 0, this.fbo.getWidth(), this.fbo.getHeight());
            ctx.setClearColor(0, 0, 0, 1);
            ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
            ctx.identity();
            ctx.scale(Vec3.set3(Vec3.create(),scale,scale,scale));
            ctx.bindProgram(this.mrtProgram);
            ctx.bindVertexArray(this.cubeVao);
            ctx.draw(ctx.TRIANGLES, 0, this.cubeVao.getIndexBuffer().getLength());
        ctx.bindFramebuffer(null); //TODO: add ctx.unbindFramebuffer?

        ctx.bindProgram(this.drawTextureProgram);
        this.drawTextureProgram.setUniform('uTexture', 0);
        ctx.bindVertexArray(this.quadVao);
        //TODO: bottom up viewport coords
        ctx.bindTexture(this.colorTex, 0);
        ctx.setViewport(0, this.height/2, this.width/2, this.height/2);
        ctx.draw(ctx.TRIANGLES, 0, this.quadVao.getIndexBuffer().getLength());

        ctx.bindTexture(this.normalTex, 0);
        ctx.setViewport(this.width/2, this.height/2, this.width/2, this.height/2);
        ctx.draw(ctx.TRIANGLES, 0, this.quadVao.getIndexBuffer().getLength());

        ctx.bindTexture(this.lightTex, 0);
        ctx.setViewport(0, 0, this.width/2, this.height/2);
        ctx.draw(ctx.TRIANGLES, 0, this.quadVao.getIndexBuffer().getLength());

        ctx.bindTexture(this.finalTex, 0);
        ctx.setViewport(this.width/2, 0, this.width/2, this.height/2);
        ctx.draw(ctx.TRIANGLES, 0, this.quadVao.getIndexBuffer().getLength());


        this.t += 1 / 60;
    }
});
