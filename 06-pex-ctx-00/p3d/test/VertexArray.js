var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');

var VERT_SRC = '\
attribute vec2 aPosition; \
attribute vec4 aColor; \
varying vec4 vColor; \
void main() { \
    gl_Position = vec4(aPosition, 0.0, 1.0); \
    vColor = aColor; \
} \
';

var FRAG_SRC = '\
varying vec4 vColor; \
void main() { \
    gl_FragColor = vColor; \
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
        var colors = new Float32Array([
            0, 0, 0, 1,
            1, 0, 0, 1,
            0, 1, 0, 1,
            0, 0, 1, 1
        ]);

        var indexBuffer = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);
        var positionBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, vertices, ctx.DYNAMIC_DRAW);
        var colorBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);
        var attributes = [
            { buffer: positionBuffer, location: ctx.ATTRIB_POSITION, size: 2, offset: 0, stride: 8 },
            { buffer: colorBuffer, location: ctx.ATTRIB_COLOR, size: 4, offset: 0, stride: 16 }
        ];
        var vao = ctx.createVertexArray(attributes, indexBuffer);

        this.vao   = vao;
    },
    update: function() {

    },
    draw: function() {
        var ctx = this.getContext();
        //ctx.setClearColor([1, 0, 0, 1]);
        ctx.setClearColor(0.2, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        ctx.bindVertexArray(this.vao);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());
    }
})
