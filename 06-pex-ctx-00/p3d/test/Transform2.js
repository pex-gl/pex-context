var Platform = require('../../sys/Platform');
var Window = require('../../sys/Window');
var Program = require('../Program');
var Mat4 = require('../../math/Mat4');
var Vec2 = require('../../math/Vec2');
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

var windowSize = Vec2.create();
if (Platform.isBrowser) {
    FRAG_SRC = 'precision highp float; \n' + FRAG_SRC;
    Vec2.set2(windowSize,window.innerWidth,window.innerHeight);
}
else {
    Vec2.set2(windowSize,800,600);
}




Window.create({
    settings: {
        width:  windowSize[0],
        height: windowSize[1],
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

        this.projectionMatrix = Mat4.perspective(Mat4.create(),45,windowSize[0] / windowSize[1],0.001,10.0);
        this.viewMatrix       = Mat4.create();

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
                Math.cos(time) * 3,3,Math.sin(time) * 3,
                0,0,0,0,1,0
            )
        );


        ctx.bindVertexArray(this.vao);

        ctx.identity();
        ctx.scale([3,3,3]);

        var size     = 30;
        var total    = size * size * size;
        var pos      = Vec3.create();
        var scale    = Vec3.create();
        var rotation = Vec3.create();
        var bufferLength = this.vao.getIndexBuffer().getLength();
        var a;

        for(var i = 0, j, k, index; i < size; ++i){
            for(j = 0; j < size; ++j){
                for(k = 0; k < size; ++k){
                    index = i * size * size + j * size + k;
                    Vec3.set3(pos,-0.5 + i/size, -0.5 + j/size, -0.5 + k/size);
                    a = (0.5 + Math.sin(time * 4.0 + Math.PI * index / total));
                    scale[0] = scale[1] = scale[2] = 1 / (size * 2) * a;
                    rotation[0] = Math.PI * time;
                    ctx.pushModelMatrix();
                        ctx.translate(pos);
                        ctx.scale(scale);
                        ctx.rotateXYZ(rotation);
                        ctx.draw(ctx.TRIANGLES, 0, bufferLength);
                    ctx.popModelMatrix();
                }
            }
        }

        this.t += 1 / 60;
    }
});
