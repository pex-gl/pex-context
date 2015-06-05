var Window   = require('./sys/Window');
var pgl      = require('./gl/pgl');

//no camera yet
var glu      = require('./gl/glu');
var Matrix44 = require('./math/Matrix44');

var VERT_SRC =
    "precision highp float;\n" +
    "attribute vec3 aVertexPosition;\n" +
    "attribute vec4 aVertexColor;\n" +
    "varying   vec4 vVertexColor;\n" +
    "uniform mat4 uModelViewMatrix;\n" +
    "uniform mat4 uProjectionMatrix;\n" +
    "uniform float uPointSize;\n" +
    "void main(){\n" +
    "   vVertexColor = aVertexColor;\n" +
    "   gl_Position  = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);\n" +
    "   gl_PointSize = uPointSize;\n" +
    "";

var FRAG_SRC =
    "precision highp float;\n" +
    "varying vec4 vVertexColor;\n" +
    "void main(){\n" +
    "	gl_FragColor = vVertexColor;\n" +
    "}";



var Settings = {
    type   : '3d',
    width  : 800,
    height : 600
};

function init(){
    var gl = this._gl;

}

function draw(){
    var gl = this._gl;

    var windowRect = this.getBounds();
    var x, y, width, height;

    //pgl = pex gl = gl patched with states stack, bad name

    // push clearColor, viewport rect, scissor test & scissor box to attrib stack
    pgl.pushAttrib(pgl.COLOR_BUFFER_BIT | pgl.VIEWPORT_BIT | pgl.SCISSOR_BIT);
        x      = windowRect[0];
        y      = windowRect[1];
        width  = windowRect[2] - 100;
        height = windowRect[3] - 100;

        pgl.enable(gl.SCISSOR_TEST);
        pgl.scissor(x,y,width,height);

        pgl.clearColor(1,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        pgl.viewport(x,y,width,height);
        pgl.pushMatrices();
            pgl.setWindowMatrices(width,height,true);
            pgl.pushMatrix();
                pgl.translate3(10,10,0);
            pgl.popMatrix();
        pgl.popMatrices();
        //projection matrix reset
    pgl.popAttrib();
    // pop attrib stack, reset all states

    console.log(pgl.getAttrib(pgl.COLOR_BUFFER_BIT | pgl.VIEWPORT_BIT | pgl.SCISSOR_BIT));

    //just push viewport, scissor test & scissor box, but keep clearColor
    pgl.pushAttrib(pgl.VIEWPORT_BIT | pgl.SCISSOR_BIT);
        x = y = width = height = 100;

        pgl.enable(gl.SCISSOR_TEST);
        pgl.scissor(x,y,width,height);

        pgl.clearColor(0,0,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        pgl.viewport(x,y,width,height);
        pgl.pushMatrices();
            pgl.setWindowMatrices(width,height,true);

        pgl.popMatrices();
    pgl.popAttrib();

    console.log(pgl.getAttrib(pgl.COLOR_BUFFER_BIT | pgl.VIEWPORT_BIT | pgl.SCISSOR_BIT));

    pgl.pushAttrib(pgl.VIEWPORT_BIT | pgl.SCISSOR_BIT);
        x = windowRect[2] - 100;
        y = windowRect[3] - 100;
        width  = 100;
        height = 100;

        pgl.enable(gl.SCISSOR_TEST);
        pgl.scissor(x,y,width,height);

        gl.clear(gl.COLOR_BUFFER_BIT);

        pgl.viewport(x,y,width,height);
    pgl.popAttrib();

    console.log(pgl.getAttrib(pgl.COLOR_BUFFER_BIT | pgl.SCISSOR_BIT));

}

Window.create({settings:Settings,init:init,draw:draw},null);