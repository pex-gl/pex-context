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

var FRAG_2_SRC = '\
uniform sampler2D uTexture; \
uniform sampler2D uTexture2; \
varying vec2 vTexCoord; \
void main() { \
    gl_FragColor = texture2D(uTexture, vTexCoord) + texture2D(uTexture2, vTexCoord); \
} \
';

if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
    FRAG_2_SRC = 'precision highp float; \n' + FRAG_2_SRC;
}

Window.create({
    settings: {
        width: 768,
        height: 512,
        type: '3d'
    },
    init: function() {
        var ctx = this.getContext();
        var program = this.program = ctx.createProgram(VERT_SRC, FRAG_SRC);
        var program2 = this.program2 = ctx.createProgram(VERT_SRC, FRAG_2_SRC);

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
        loadImage(assetsPath + '/img/octocat.png', function(err, img) {
            this.octocat = ctx.createTexture2D(img, img.width, img.height)
        }.bind(this))
        loadImage(assetsPath + '/img/plask.png', function(err, img) {
            this.plask = ctx.createTexture2D(img, img.width, img.height)
        }.bind(this))
        loadImage(assetsPath + '/img/checker.png', function(err, img) {
            this.checker = ctx.createTexture2D(img, img.width, img.height)
        }.bind(this))
    },
    update: function() {

    },
    draw: function() {
        var ctx = this.getContext();
        //ctx.setClearColor([1, 0, 0, 1]);
        ctx.setClearColor(0.92, 0.2, 0.2, 1);
        ctx.clear(ctx.COLOR_BIT | ctx.DEPTH_BIT);

        if (!this.octocat || !this.plask || !this.checker) {
            return;
        }

        ctx.bindVertexArray(this.vao);

        ctx.bindProgram(this.program);

        ctx.bindTexture(this.octocat, 0);
        this.program.setUniform('uTexture', 0);
        ctx.setViewport(0, 256, 256, 256);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());

        ctx.bindTexture(this.plask, 1);
        this.program.setUniform('uTexture', 1);
        ctx.setViewport(256, 256, 256, 256);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());

        ctx.bindTexture(this.checker, 2);
        this.program.setUniform('uTexture', 2);
        ctx.setViewport(2*256, 256, 256, 256);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());

        ctx.bindProgram(this.program2);
        this.program2.setUniform('uTexture', 0);
        this.program2.setUniform('uTexture2', 1);
        ctx.setViewport(0, 0, 256, 256);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());

        ctx.pushState(ctx.TEXTURE_BIT);
            ctx.bindTexture(this.plask, 0);
            ctx.bindTexture(this.checker, 1);
            ctx.setViewport(256, 0, 256, 256);
            ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());
        ctx.popState(ctx.TEXTURE_BIT);

        ctx.setViewport(2*256, 0, 256, 256);
        ctx.draw(ctx.TRIANGLES, 0, this.vao.getIndexBuffer().getLength());
    }
})
