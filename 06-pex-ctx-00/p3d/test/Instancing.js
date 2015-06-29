var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');

var VERT_SRC = '\
attribute vec3 aPosition; \
attribute vec3 aColor; \
attribute vec3 aTexCoord0; \
varying vec3 vColor; \
uniform mat4 uProjectionMatrix;\
uniform mat4 uViewMatrix;\
uniform mat4 uModelMatrix;\
void main() { \
    vec3 offset = aTexCoord0; \
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition + offset, 1.0); \
    vColor = aColor; \
} \
';

var FRAG_SRC = '' +
'varying vec3 vColor;\n' +
'void main() {\n' +
'    gl_FragColor= vec4(vColor, 1.0);\n' +
'}\n';

if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
}

Window.create({
    settings: {
        width: 1280,
        height: 720,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();

        this.cubeProgram = ctx.createProgram(VERT_SRC, FRAG_SRC);

        this.projectionMatrix = Mat4.perspective(Mat4.create(),45,this.getAspectRatio(),0.001,100.0);
        this.viewMatrix       = Mat4.create();

        this.t = 0;

        this.cubeVao    = this.createInstancedCube();

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this.projectionMatrix);
    },
    createInstancedCube: function() {
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

        var offsets = [];
        var r = 60;
        for(var i=0; i<5000; i++) {
            offsets.push(Math.random()*r-r/2, Math.random()*r-r/2, Math.random()*r-r/2);
        }

        var instancedOffsetBuffer = ctx.createBuffer(
            ctx.ARRAY_BUFFER,
            new Float32Array(offsets),
            ctx.STATIC_DRAW
        )

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
            { buffer : positionColorNormalBuffer, location : ctx.ATTRIB_NORMAL,   size : 3, stride : 9 * 4, offset : 6 * 4 },
            { buffer : instancedOffsetBuffer, location : ctx.ATTRIB_TEX_COORD_0, size : 3, stride : 3 * 4, offset : 0, divisor: 1 }
        ];
        return ctx.createVertexArray(attributes,indexBuffer);
    },
    draw: function() {
        var ctx = this.getContext();
        var time = this.t / 10;

        ctx.setClearColor(0, 0, 0, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                16 * Math.cos(time * Math.PI),
                4 * Math.sin(time * 0.5),
                16 * Math.sin(time * Math.PI),
                0,0,0,0,1,0
            )
        );

        var scale = 0.75 + (0.5 + Math.cos(time * Math.PI * 2) * 0.5) * 0.25;

        ctx.bindProgram(this.cubeProgram);
        ctx.bindVertexArray(this.cubeVao);
        ctx.identity();
        ctx.scale([0.2, 0.2, 0.2]);
        ctx.draw(ctx.TRIANGLES, 0, this.cubeVao.getIndexBuffer().getLength());

        this.t += 1 / 60;
    }
});
