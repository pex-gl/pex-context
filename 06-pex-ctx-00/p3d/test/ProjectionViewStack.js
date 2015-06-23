var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');

var VERT_SRC = '\
attribute vec4 aPosition; \
attribute vec3 aColor; \
varying vec3 vColor; \
uniform mat4 uProjectionMatrix;\
uniform mat4 uViewMatrix;\
uniform mat4 uModelMatrix;\
void main() { \
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition; \
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

var WINDOW_SIZE = [800,600];

Window.create({
    settings: {
        width:  WINDOW_SIZE[0],
        height: WINDOW_SIZE[1],
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();
        var program = ctx.createProgram(VERT_SRC, FRAG_SRC);
        ctx.bindProgram(program);

        var positionColorBuffer = ctx.createBuffer(
            ctx.ARRAY_BUFFER,
            new Float32Array([
                1.0, 1.0, 1.0,   1.0, 0.0, 0.0,
                -1.0, 1.0, 1.0,   1.0, 0.0, 0.0,
                1.0,-1.0, 1.0,   1.0, 0.0, 0.0,
                -1.0,-1.0, 1.0,   1.0, 0.0, 0.0,

                1.0, 1.0, 1.0,   0.0, 1.0, 0.0,
                1.0,-1.0, 1.0,   0.0, 1.0, 0.0,
                1.0, 1.0,-1.0,   0.0, 1.0, 0.0,
                1.0,-1.0,-1.0,   0.0, 1.0, 0.0,

                1.0, 1.0, 1.0,   0.0, 0.0, 1.0,
                1.0, 1.0,-1.0,   0.0, 0.0, 1.0,
                -1.0, 1.0, 1.0,   0.0, 0.0, 1.0,
                -1.0, 1.0,-1.0,   0.0, 0.0, 1.0,

                1.0, 1.0,-1.0,   1.0, 1.0, 0.0,
                1.0,-1.0,-1.0,   1.0, 1.0, 0.0,
                -1.0, 1.0,-1.0,   1.0, 1.0, 0.0,
                -1.0,-1.0,-1.0,   1.0, 1.0, 0.0,

                -1.0, 1.0, 1.0,   0.0, 1.0, 1.0,
                -1.0, 1.0,-1.0,   0.0, 1.0, 1.0,
                -1.0,-1.0, 1.0,   0.0, 1.0, 1.0,
                -1.0,-1.0,-1.0,   0.0, 1.0, 1.0,

                1.0,-1.0, 1.0,   1.0, 0.0, 1.0,
                -1.0,-1.0, 1.0,   1.0, 0.0, 1.0,
                1.0,-1.0,-1.0,   1.0, 0.0, 1.0,
                -1.0,-1.0,-1.0,   1.0, 0.0, 1.0
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
            {buffer : positionColorBuffer, location : ctx.ATTRIB_POSITION, size : 3, stride : 6 * 4, offset : 0},
            {buffer : positionColorBuffer, location : ctx.ATTRIB_COLOR, size : 3, stride : 6 * 4, offset : 3 * 4}
        ];
        this.vao = ctx.createVertexArray(attributes,indexBuffer);

        this.projectionMatrix = Mat4.perspective(Mat4.create(),45,this.getAspectRatio(),0.001,10.0);
        this.viewMatrix       = Mat4.create();

        this.t = 0;

        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this.projectionMatrix);
        ctx.setViewport(0,0,WINDOW_SIZE[0],WINDOW_SIZE[1]);

        ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix, 3,3,3, 0,0,0,0,1,0));
    },
    draw: function() {
        var ctx = this.getContext();
        var time = this.t;

        ctx.bindVertexArray(this.vao);

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        var scale = 0.75 + (0.5 + Math.cos(time * Math.PI * 2) * 0.5) * 0.25;
        ctx.pushModelMatrix();
            ctx.identity();
            ctx.scale(Vec3.set3(Vec3.create(),scale,scale,scale));
            ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());
        ctx.popModelMatrix();

        ctx.pushViewMatrix();
        ctx.pushState(ctx.VIEWPORT_BIT | ctx.SCISSOR_BIT | ctx.VERTEX_ARRAY_BIT);
            ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                    Math.cos(time * Math.PI) * 5,
                    Math.sin(time * 0.5) * 4,
                    Math.sin(time * Math.PI) * 5,
                    0,0,0,0,1,0
                )
            );

            ctx.setScissorTest(true);

            ctx.setViewport(0,0,WINDOW_SIZE[0] * 0.25,WINDOW_SIZE[1] * 0.25);
            ctx.setScissor(0,0,WINDOW_SIZE[0] * 0.25, WINDOW_SIZE[1] * 0.25);
            ctx.setClearColor(1.0,0,0,1.0);
            ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
            ctx.draw(ctx.TRIANGLES,0,this.vao.getIndexBuffer().getLength());

            ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                    0,
                    -4.0,
                    0.001,
                    0,0,0,0,1,0
                )
            );

            ctx.setViewport(WINDOW_SIZE[0] - WINDOW_SIZE[0] * 0.25,0, WINDOW_SIZE[0] * 0.25, WINDOW_SIZE[1] * 0.25);
            ctx.setScissor(WINDOW_SIZE[0] - WINDOW_SIZE[0] * 0.25,0, WINDOW_SIZE[0] * 0.25, WINDOW_SIZE[1] * 0.25);
            ctx.setClearColor(0,0,1.0,1.0);
            ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);
            ctx.identity();
            ctx.rotate(time,[0,1,0]);
            ctx.draw(ctx.TRIANGLES,0,this.vao.getIndexBuffer().getLength());

            ctx.setViewMatrix(Mat4.identity(this.viewMatrix));


        ctx.popState(ctx.VIEWPORT_BIT | ctx.SCISSOR_BIT | ctx.VERTEX_ARRAY_BIT);
        ctx.popViewMatrix();

        this.t += 1 / 60;
    }
});
