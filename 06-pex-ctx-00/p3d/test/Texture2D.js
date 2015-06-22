var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var loadImage = require('../../sys/io/loadImage');

var VERT_SRC = '\
attribute vec2 aPosition; \
attribute vec2 aTexCoord0; \
varying vec2 vTexCoord; \
void main() { \
    gl_Position = vec4(aPosition, 0.0, 1.0); \
    vTexCoord = aTexCoord0; \
} \
';

var FRAG_SRC = '\
uniform sampler2D uTexture; \
varying vec2 vTexCoord; \
void main() { \
    gl_FragColor = texture2D(uTexture, vTexCoord); \
} \
';

if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
}

Window.create({
    settings: {
        width: 512,
        height: 512,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();
        var program = ctx.createProgram(VERT_SRC, FRAG_SRC);
        ctx.bindProgram(program);

        //FIXME: Weird, sampler2D uniform doesn't work in safari
        //program.setUniform('uTexture', 0);

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
        this.vao = ctx.createVertexArray(attributes, indexBuffer);

        var assetsPath = Platform.isBrowser ? 'assets' : __dirname + '/assets';
        var file = assetsPath + '/img/octocat.png'
        console.log(file);
        loadImage(file, function(err, img) {
            this.img = img;
        }.bind(this))

    },
    update: function() {

    },
    draw: function() {
        var ctx = this.getContext();
        //ctx.setClearColor([1, 0, 0, 1]);
        ctx.setClearColor(0.92, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        if (this.img && !this.texture) {
            this.texture = ctx.createTexture2D(this.img, this.img.width, this.img.height)
        }

        ctx.bindVertexArray(this.vao);
        if (this.texture) {
            ctx.bindTexture(this.texture, 0);
        }
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());
    }
})
