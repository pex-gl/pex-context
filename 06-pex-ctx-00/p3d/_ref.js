var fs   = require('fs');
var path = require('path');

var Utils    = require('../_common/Utils');
var glu      = require('../_common/glu');
var Matrix44 = require('../_common/Matrix44');
var Vec3     = require('../_common/Vec3');
var Context  = require('../../index.js');
var gl       = Context.gl;

var VERT_SRC =
    "#version 330\n" +
    "uniform mat4 uProjectionMatrix;\n"  +
    "uniform mat4 uModelMatrix;\n" +
    "uniform mat4 uViewMatrix;\n"  +
    "layout(location = 0) in vec4 aVertexPosition;\n" +
    "layout(location = 1) in vec4 aVertexColor;\n" +
    "out vec4 vVertexColor;\n" +
    "void main() {\n" +
    "   vVertexColor = aVertexColor;\n" +
    "   gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aVertexPosition;\n" +
    "}\n";

var FRAG_SRC =
    "#version 330\n" +
    "in vec4 vVertexColor;\n" +
    "layout(location = 0) out vec4 FragColor;\n" +
    "void main() {\n" +
    "   FragColor = vVertexColor;\n" +
    "}\n";

var cubeVertices = [
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0,  1.0,-1.0, 1.0, -1.0,-1.0, 1.0,
    1.0, 1.0, 1.0,  1.0,-1.0, 1.0,  1.0, 1.0,-1.0,  1.0,-1.0,-1.0,
    1.0, 1.0, 1.0,  1.0, 1.0,-1.0, -1.0, 1.0, 1.0, -1.0, 1.0,-1.0,
    1.0, 1.0,-1.0,  1.0,-1.0,-1.0, -1.0, 1.0,-1.0, -1.0,-1.0,-1.0,
    -1.0, 1.0, 1.0, -1.0, 1.0,-1.0, -1.0,-1.0, 1.0, -1.0,-1.0,-1.0,
    1.0,-1.0, 1.0, -1.0,-1.0, 1.0,  1.0,-1.0,-1.0, -1.0,-1.0,-1.0,
];

var cubeIndices = [
    0, 1, 2, 2, 1, 3,
    4, 5, 6, 6, 5, 7,
    8, 9,10,10, 9,11,
    12,13,14,14,13,15,
    16,17,18,18,17,19,
    20,21,22,22,21,23
]

function createVaoBg(){
    var ctx = this.ctx;
    this._vaoBg = ctx.createVao();
    this._vboBg = ctx.createVbo();

    this._vboBg = ctx.createVbo(ctx.ARRAY_BUFFER, new Float32Array([
        1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
        -1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
        1.0, -1.0, 0.0, 0.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 0.0, 0.0, 1.0,
        -1.0,  1.0, 0.0, 1.0, 0.0, 0.0,
        -1.0, -1.0, 0.0, 0.0, 0.0, 1.0
    ]), ctx.STATIC_DRAW);

    this._vaoBg.setAttributeLayout(
        this._vboBg,[
            new Attribute(0,3,ctx.FLOAT,false,6 * 4,0    ),
            new Attribute(1,3,ctx.FLOAT,false,6 * 4,3 * 4)
        ]
    );
}

function createVao0(){
    var ctx = this.ctx;
    this._vao0 = ctx.createVao(ctx.ARRAY_BUFFER, new Float32Array(cubeVertices.slice(0).concat([
        1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
        1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
        0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
        1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0
    ])),gl.STATIC_DRAW);

    this._ibo1 = ctx.createVbo(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    this._vao1.setAttributeLayout(
        this._vbo1,[
            new Vbo.Attribute(0, 3, ctx.FLOAT),
            new Vbo.Attribute(1, 3, ctx.FLOAT, 0, 3 * 4 * 6 * 4)
        ]
    );
}

function createVao1(){
    var ctx = this.ctx;

    this._vao1 = ctx.createVao();

    this._vbo1 = ctx.createVbo(ctx.ARRAY_BUFFER, new Float32Array(cubeVertices.slice(0).concat([
            1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,  1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,  0.0, 0.0, 1.0,
            1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,  1.0, 1.0, 0.0,
            0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,  0.0, 1.0, 1.0,
            1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0,  1.0, 0.0, 1.0])),
        ctx.STATIC_DRAW);

    this._ibo1 = ctx.createVbo(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    this._vao1.setAttributeLayout(
        this._vbo1,[
            new Vbo.Attribute(0, 3, ctx.FLOAT),
            new Vbo.Attribute(1, 3, ctx.FLOAT, 0, 3 * 4 * 6 * 4)
        ]
    );
    this._vao1.setBufferLayouts(
        new BufferLayout(
            buffer1, [
                new Vbo.Attribute(0, 3, ctx.FLOAT),
                new Vbo.Attribute(1, 3, ctx.FLOAT, 0, 3 * 4 * 6 * 4)
            ]
        ),
        new BufferLayout(
            buffer2, [
                new Vbo.Attribute(0, 3, ctx.FLOAT),
                new Vbo.Divisor( 0, 3 * 4 * 6 * 4)
            ]
        )
    )
    this._vao1.setBufferLayouts([
            new Vbo.Attribute(buffer0, 0, 3, ctx.FLOAT),
            new Vbo.Attribute(buffer0, 1, 3, ctx.FLOAT, 0, 3 * 4 * 6 * 4),
            new Vbo.Attribute(buffer1, 0, 3, ctx.FLOAT),
        ]
    )
}

function setup(){
    var screenSize = this.getScreenSize();
    this.initWindow(screenSize[0] * 0.75,screenSize[1] * 0.75);

    var ctx = this.ctx;

    this._program = ctx.createProgram((VERT_SRC, FRAG_SRC);
    ctx.bindProgram(this._program);

    this.createVaoBg();
    this.createVao0();
    this.createVao1();

    ctx.clearColor(0,0,0,1);
    ctx.setDepthTest(true);

    this._matrixModel      = mat44();
    this._matrixView       = mat44();
    this._matrixProjection = mat44();
}

function update(){
    ctx.clear(ctx.DEPTH_BUFFER_BIT | ctx.COLOR_BUFFER_BIT);

    var t = this.getSecondsElapsed();

    var windowSize = this.getWindowSize();
    ctx.setViewport(0,0,windowSize[0],windowSize[1]);
    ctx.setDepthTest(false);
    ctx.setProjectionMatrix(mat44Identity(this._matrixProjection));
    ctx.setViewMatrix(mat44Identity(this._matrixView));
    ctx.setModelMatrix(mat44Identity(this._matrixModel));

    ctx.bindVao(this._vaoBg);
    ctx.draw(ctx.TRIANGLES);

    ctx.setDepthTest(true);
    glu.perspective(this._matrixProjection.m,45, this.getWindowAspectRatio(), 0.01, 100);

    var d = 2.25 + (0.5 + Math.sin(t) * 0.5) * 7.75;
    glu.lookAt(this._matrixView.m,Math.cos(t) * d, Math.sin(t * 0.125) * 1.25,Math.sin(t) * d, 0,0,0, 0,1,0);

    ctx.setProjectionMatrix(mat44Identity(this._matrixProjection));
    ctx.setModelMatrix(mat44Identity(this._matrixModel));

    if(this.isKeyDown(Context.KEY_SPACE)){
        ctx.bindVao(this._vao0);
    } else {
        cxt.bindVao(this._vao1);
    }

    console.log('ARRAY_BUFFER_BINDING',gl.getParameter(gl.ARRAY_BUFFER_BINDING));
    console.log('ELEMENT_ARRAY_BUFFER_BINDING',gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING));

    var k = 0.5 + Math.sin(t * 4) * 0.5;
    var c = new Float32Array(3 * 4 * 6);
    for(var i = 0, l = c.length; i < l; ++i){
        c[i] = k;
    }
    this._vbo1.bufferSubData(gl.ARRAY_BUFFER, c.byteLength, c);

    ctx.setMatrixMode(ctx.MODEL_MATRIX);
    ctx.pushMatrix();

    var size  = 20;
    var total = size * size * size;
    var pos   = new Vec3();
    var scale = 4;
    var scale_;
    for(var i = 0, j, k, index; i < size; ++i){
        for(j = 0; j < size; ++j){
            for(k = 0; k < size; ++k){
                index  = (i * size * size + j * size + k);
                pos.setf(i/size,j/size,k/size);
                scale_ = Math.sin(t + Math.PI * 16.0 * index / total);
                ctx.pushMatrix();
                ctx.translate3((-0.5 + pos.x) * scale ,(-0.5 + pos.y) * scale,(-0.5 + pos.z) * scale);
                ctx.scale3(0.10,0.10,0.10);
                ctx.scale3(this._uniformLocations['uModelMatrix'],false,this._matrixModel.toFloat32Array());
                ctx.draw(ctx.TRIANGLES);
                ctx.popMatrix();
            }
        }
    }

    ctx.popMatrix();
}

Context.new({setup:setup,createVaoBg : createVaoBg, createVao0:createVao0,createVao1:createVao1,update:update});
