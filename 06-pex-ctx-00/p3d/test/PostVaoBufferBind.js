var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Vec3 = require('../../math/Vec3');

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

Window.create({
    settings: {
        width: 800,
        height: 600,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();
        var program = ctx.createProgram(VERT_SRC, FRAG_SRC);
        ctx.bindProgram(program);

        var positionColorBuffer = ctx.createBuffer(
            ctx.ARRAY_BUFFER,
            new Float32Array([
                 1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
                -1.0, 1.0, 0.0,   1.0, 0.0, 0.0,
                 1.0,-1.0, 0.0,   1.0, 0.0, 0.0,
                -1.0,-1.0, 0.0,   1.0, 0.0, 0.0
            ]),
            ctx.STATIC_DRAW
        );

        var indexBuffer = ctx.createBuffer(
            ctx.ELEMENT_ARRAY_BUFFER,
            new Uint16Array([
                0, 1, 2, 2, 1, 3
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

        this.bufferRewrite = ctx.createBuffer(
            ctx.ARRAY_BUFFER,
            new Float32Array([0,1,2,3]),
            ctx.STATIC_DRAW,
            true
        );

        this.t = 0;

        ctx.setClearColor(0.2,0.2,0.2,1.0);
        ctx.setDepthTest(true);
        ctx.setProjectionMatrix(this.projectionMatrix);
    },
    draw: function() {
        var ctx = this.getContext();
        var time = this.t;

        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.setViewMatrix(Mat4.lookAt9(this.viewMatrix,
                Math.cos(time * Math.PI) * 5,
                Math.sin(time * 0.5) * 4,
                Math.sin(time * Math.PI) * 5,
                0,0,0,0,1,0
            )
        );

        ctx.bindVertexArray(this.vao);

        var data = this.bufferRewrite.getData();
        data[0] = data[1] = data[2] = data[3] = time;
        this.bufferRewrite.bufferData();

        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());

        this.t += 1 / 60;
    }
});
