var Window = require('../../sys/Window');
var Program = require('../Program');

var VERT_SRC = '\
attribute vec2 position; \
void main() { \
    gl_Position = vec4(position, 0.0, 1.0); \
} \
';

var FRAG_SRC = '\
uniform vec4 uColor; \
void main() { \
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); \
    gl_FragColor = uColor; \
} \
';

Window.create({
    settings: {
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

        var indexBuffer = ctx.createBuffer(ctx.ELEMENT_BUFFER, indices, ctx.STATIC_DRAW);
        var positionBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, vertices, ctx.DYNAMIC_DRAW);
        var colorBuffer = ctx.createBuffer(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);
        var attributes = [
            { buffer: positionBuffer, location: ctx.ATTRIB_POSITION, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0 },
            { buffer: colorBuffer, location: ctx.ATTRIB_COLOR, size: 3, type: ctx.FLOAT, offset: 0, stride: 12, divisor: 0 }
        ];
        var vao = ctx.createVertexArray(attributes, indexBuffer);
        ctx.bindVertexArray(vao);
        ctx.draw(ctx.TRIANGLES, 0, vertices.length/3);
    },
    update: function() {

    },
    draw: function() {
        var ctx = this.getContext();
        //ctx.setClearColor([1, 0, 0, 1]);
        ctx.setClearColor(0.2, 0.2, 0.2, 1);

        ctx.clear(ctx.COLOR_BIT);
    }
})
