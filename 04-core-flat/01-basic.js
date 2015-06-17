var Window   = require('./sys/Window');
var glu      = require('./gl/glu');
var $m       = require('./math/Matrix44Operator');

var Program  = require('./gl/Program');
var Vao      = require('./gl/Vao');
var Vbo      = require('./gl/Vbo');
var State    = require('./gl/State');

var PerspCamera = require('./gl/PerspectiveCamera');


var VERT_SRC =
    "attribute vec3 aVertexPosition;\n" +
    "attribute vec3 aVertexColor;\n" +
    "varying   vec3 vVertexColor;\n" +
    "uniform mat4 uModelViewMatrix;\n" +
    "uniform mat4 uProjectionMatrix;\n" +
    "uniform float uPointSize;\n" +
    "uniform vec3 uScale;\n" +
    "void main(){\n" +
    "   vVertexColor = aVertexColor;\n" +
    "   gl_Position  = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition * uScale,1.0);\n" +
    "   gl_PointSize = uPointSize;\n" +
    "}";

var FRAG_SRC =
    "varying vec3 vVertexColor;\n" +
    "void main(){\n" +
    "	gl_FragColor = vec4(vVertexColor,1.0);\n" +
    "}";

var Settings = {
    type   : '3d',
    width  : 800,
    height : 600
};

function init(){
    var gl = this._gl;
    var program = this._program = new Program(
        VERT_SRC,FRAG_SRC,
        {0 : 'aVertexPosition', 1 : 'aVertexColor'}
    );
    //
    //console.log('program','num attributes',program.getNumAttributes());
    //console.log('program','attributes',program.getAttributes());
    //console.log('program','location aVertexPosition',program.getAttribLocation('aVertexPosition'));
    //console.log('program','type aVertexColor',program.getAttribType('aVertexColor'));
    //console.log('program','num uniforms',program.getNumUniforms());
    //console.log('program','uniform info uPointSize',program.getUniformInfo('uPointSize'));
    //
    program.bind();
    program.uniform('uPointSize',1.0);

    gl.clearColor(0,0,0,1);
    gl.enable(gl.DEPTH_TEST);

    this._camera = new PerspCamera(45);
    this._camera.setFar(20.0);

    //
    //this._matrixModelView = new Matrix44();
    //this._matrixProjection = new Matrix44();
    this._matrixTranslationL = new Float32Array(16);
    this._matrixTranslationR = new Float32Array(16);

    //glu.perspective(this._matrixProjection.m,45.0,this.getAspectRatio(),0.001,20.0);
    //glu.lookAt(this._matrixModelView.m, 0,-1,0, 0,0,0, 0,1,0);

    gl.clearColor(0.15,0.15,0.15,1);
    gl.enable(gl.DEPTH_TEST);

    this._vboCubeVertices0 = new Vbo(
        gl.ARRAY_BUFFER,
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
        gl.STATIC_DRAW
    );
    //
    //console.log('vboCubeVertices0','dataType',this._vboCubeVertices0.getDataType());
    //console.log('vboCubeVertices0','byteLength',this._vboCubeVertices0.getByteLength());
    //console.log('vboCubeVertices0','length',this._vboCubeVertices0.getLength());
    //
    this._iboCube0 = new Vbo(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([
             0, 1, 2, 2, 1, 3,
             4, 5, 6, 6, 5, 7,
             8, 9,10,10, 9,11,
            12,13,14,14,13,15,
            16,17,18,18,17,19,
            20,21,22,22,21,23
        ]),
        gl.STATIC_DRAW
    );
    //
    //console.log('iboCube0','dataType',this._iboCube0.getDataType());
    //console.log('iboCube0','byteLength',this._iboCube0.getByteLength());
    //console.log('iboCube0','length',this._iboCube0.getLength());
    //
    this._iboCube1 = new Vbo(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([
            0,1,2, 2,1,3,
            8, 9,10,10, 9,11,
            12,13,14,14,13,15,
            20,21,22,22,21,23
        ])
    );

    this._vao0 = new Vao();
    this._vao0.bind();
    this._vboCubeVertices0.bind();
    this._iboCube0.bind();
    this._vao0.enableVertexAttribArray(0);                               //state saved relative to vbo 0
    this._vao0.vertexAttribPointer(0,3,gl.FLOAT,false, 6 * 4, 0);        //state saved relative to vbo 0
    this._vao0.enableVertexAttribArray(1);                               //state saved relative to vbo 0
    this._vao0.vertexAttribPointer(1,3, gl.FLOAT, false, 6 * 4, 3 * 4);  //state saved relative to vbo 0

    console.log(State.getParameter(State.PEX_VERTEX_ARRAY_BINDING).getId());
    console.log(State.getParameter(State.PEX_ARRAY_BUFFER_BINDING).getId());
    console.log(State.getParameter(State.PEX_ELEMENT_ARRAY_BUFFER_BINDING).getId());

    this._vao1 = new Vao();
    this._vao1.bind();
    this._vboCubeVertices0.bind();
    this._iboCube1.bind();
    this._vao1.enableVertexAttribArray(0);                          //state saved relative to vbo 0
    this._vao1.vertexAttribPointer(0,3,gl.FLOAT,false, 6 * 4, 0);   //state saved relative to vbo 0
    this._vao1.disableVertexAttribArray(1);                         //state saved relative to vbo 0

    console.log(State.getParameter(State.PEX_VERTEX_ARRAY_BINDING).getId());
    console.log(State.getParameter(State.PEX_ARRAY_BUFFER_BINDING).getId());
    console.log(State.getParameter(State.PEX_ELEMENT_ARRAY_BUFFER_BINDING).getId());

}

var t = 0.0; //no time added atm

function draw(){
    var gl      = this._gl;
    var program = this._program;
    var camera  = this._camera;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vaoIndexBuffer;
    var scale;

    var d = 2.25 + (0.5 + Math.sin(t) * 0.5) * 7.75;
    camera.lookAt3(Math.cos(t) * d, Math.sin(t * 0.125) * 1.25,Math.sin(t) * d, 0,0,0);

    //whatever this will look int the end
    //temporary wraps flat data
    $m(this._matrixTranslationL).set(camera.getViewMatrix()).translatef(-2,0,0);
    $m(this._matrixTranslationR).set(camera.getViewMatrix()).translatef( 2,0,0);

    program.bind();
    program.uniform('uProjectionMatrix',camera.getProjectionMatrix());

    program.uniform('uModelViewMatrix', this._matrixTranslationL);
    scale = 0.5 + (0.5 + Math.sin(t * 2 + Math.PI) * 0.5) * 0.5;
    program.uniform('uScale',scale,scale,scale);

    this._vao0.apply();
    vaoIndexBuffer = this._vao0.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    gl.drawElements(gl.TRIANGLES, vaoIndexBuffer.getLength(), vaoIndexBuffer.getDataFormat(), 0);

    program.uniform('uModelViewMatrix', this._matrixTranslationR);
    scale = 0.5 + (0.5 + Math.sin(t * 2) * 0.5) * 0.5;
    program.uniform('uScale',scale,scale,scale);

    this._vao1.apply();
    vaoIndexBuffer = this._vao1.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING);
    gl.drawElements(gl.TRIANGLES, vaoIndexBuffer.getLength(), vaoIndexBuffer.getDataFormat(), 0);

    t += 1.0 / 60.0;
}

Window.create({settings:Settings,init:init,draw:draw},null);