var Mat4 = require('../math/Mat4');
var Vec3 = require('../math/Vec3');
var Vec4 = require('../math/Vec4');

var ProgramUniform = require('./ProgramUniform');

//STATE BITS

var DEPTH_BIT        = 1 << 0;
var COLOR_BIT        = 1 << 1;
var STENCIL_BIT      = 1 << 2;
var VIEWPORT_BIT     = 1 << 3;
var SCISSOR_BIT      = 1 << 4;

var COLOR_BUFFER_BIT = null;
var DEPTH_BUFFER_BIT = null;

var MATRIX_PROJECTION_BIT = 1 << 16;
var MATRIX_VIEW_BIT       = 1 << 17;
var MATRIX_MODEL_BIT      = 1 << 18;

//


function Context(gl){
    this._gl = gl;

    this._mask = -1;

    this._depthTest       = false;
    this._depthMask       = gl.getParameter(gl.DEPTH_WRITEMASK);
    this._depthFunc       = gl.getParameter(gl.DEPTH_FUNC);
    this._depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    this._depthRange      = gl.getParameter(gl.DEPTH_RANGE);
    this._polygonOffset   = [gl.getParameter(gl.POLYGON_OFFSET_FACTOR),gl.getParameter(gl.POLYGON_OFFSET_UNITS)];
    this._depthStack      = [];

    this._clearColor      = [0,0,0,1];
    this._colorMask       = gl.getParameter(gl.COLOR_WRITEMASK);
    this._colorStack      = [];

    this._viewport   = [0,0,0,0];
    this._viewportStack = [];

    this._matrix = {};
    this._matrix[MATRIX_PROJECTION_BIT] = Mat4.create();
    this._matrix[MATRIX_VIEW_BIT]       = Mat4.create();
    this._matrix[MATRIX_MODEL_BIT]      = Mat4.create();

    this._matrixStack = {};
    this._matrixStack[MATRIX_PROJECTION_BIT] = [];
    this._matrixStack[MATRIX_VIEW_BIT]       = [];
    this._matrixStack[MATRIX_MODEL_BIT]      = [];

    this._matrixUnifomMap = {};
    this._matrixUnifomMap[MATRIX_PROJECTION_BIT] = ProgramUniform.PROJECTION_MATRIX;
    this._matrixUnifomMap[MATRIX_VIEW_BIT]       = ProgramUniform.VIEW_MATRIX;
    this._matrixUnifomMap[MATRIX_MODEL_BIT]      = ProgramUniform.MODEL_MATRIX;

    this._matrixMode    = MATRIX_MODEL_BIT;
    this._matrixF32Temp = new Float32Array(16);

    this._program = null;
    this._programUniformLocations = null;
}

Context.prototype.push = function(mask){
    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        this._viewportStack.push(this._viewport.slice(0));
    }

    if((mask & COLOR_BIT) == COLOR_BIT){
        this._colorStack.push([
            this._clearColor.slice(0),
            this._colorMask.slice(0)
        ]);
    }

    this._mask = mask;
};

Context.prototype.pop = function(){
    var gl   = this._gl;
    var mask = this._mask;
    var prev;
    var stack;

    if((mask & DEPTH_BIT) == DEPTH_BIT){

    }

    if((mask & COLOR_BIT) == COLOR_BIT){
        prev  = this._colorStack.pop();
        stack = this._colorStack[this._colorStack.length - 1];
        this._clearColor = stack[0];
        this._colorMask  = stack[1];

        if(!Vec4.equals(this._clearColor,prev){
            gl
        }

    )

        this._clearColor = this._colorStack[this._co]
    }

    if((mask & STENCIL_BIT) == STENCIL_BIT){

    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        prev = this._viewportStack.pop();
        this._viewport = this._viewportStack.pop();
        this._gl.viewport(this._viewport[0])
    }

    if((mask && SCISSOR_BIT) == SCISSOR_BIT){

    }
};

Context.prototype.setViewport = function(x,y,width,height){
    if(x == this._viewport[0] &&
       y == this._viewport[1] &&
       width  == this._viewport[2] &&
       height == this._viewport[3]){
        return;
    }
    this._viewport[0] = x;
    this._viewport[1] = y;
    this._viewport[2] = width;
    this._viewport[3] = height;
    this._gl.viewport(x,y,width,height);
};

Context.prototype.getViewport = function(out){
    if(out !== undefined){
        out[0] = this._viewport[0];
        out[1] = this._viewport[1];
        out[2] = this._viewport[2];
        out[3] = this._viewport[3];
        return out;
    }
    return this._viewport.slice(0);
};

Context.prototype.setClearColor = function(r,g,b,a){
    if(r == this._clearColor[0] &&
       g == this._clearColor[1] &&
       b == this._clearColor[2] &&
       a == this._clearColor[3]){
        return;
    }
    this._clearColor[0] = r;
    this._clearColor[1] = g;
    this._clearColor[2] = b;
    this._clearColor[3] = a;
    this._gl.clearColor(r,g,b,a);
};

Context.prototype.getClearColor = function(out){
    if(out !== undefined){
        out[0] = this._clearColor[0];
        out[1] = this._clearColor[0];
        out[2] = this._clearColor[0];
        out[3] = this._clearColor[0];
        return out;
    }
    return this._clearColor.slice(0);
};

Context.prototype.setDepthTest = function(depthTest){
    this._depthTest = depthTest;
};

Context.prototype.getDepthTest = function(){
    return this._depthTest;
};

Context.prototype.clear = function(mask){
    this._gl.clear(mask);
};

Context.prototype.bindProgram = function(program){
    this._programUniformLocations = program.getUniformLocations();

};

Context.prototype.bindVao = function(vao){

};

Context.prototype.draw = function(mode,first,count){

};

Context.prototype.getGL = function(){
    return this._gl;
};

Context.prototype.setProjectionMatrix = function(matrix){
    var _matrix = Mat4.copy(matrix,this._matrix[MATRIX_PROJECTION_BIT]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.PROJECTION_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.setViewMatrix = function(matrix){
    var _matrix = Mat4.copy(matrix,this._matrix[MATRIX_VIEW_BIT]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.VIEW_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.setModelMatrix = function(matrix){
    var _matrix = Mat4.copy(matrix,this._matrix[MATRIX_MODEL_BIT]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.MODEL_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.getProjectionMatrix = function(out){
    return Mat4.copy(this._matrix[MATRIX_PROJECTION_BIT],out);
};

Context.prototype.getViewMatrix = function(out){
    return Mat4.copy(this._matrix[MATRIX_VIEW_BIT],out);
};

Context.prototype.getModelMatrix = function(out){
    return Mat4.copy(this._matrix[MATRIX_MODEL_BIT],out);
};

Context.prototype.setMatrixMode = function(matrixMode){
    this._matrixMode = matrixMode;
};


Context.prototype.getMatrixMode = function(){
    return this._matrixMode;
};

Context.prototype.setMatrix = function(matrix){
    var _matrix = Mat4.copy(matrix,this._matrix[this._matrixMode]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[this._matrixUnifomMap[this._matrixMode]],this._matrixF32Temp);
};

Context.prototype.getMatrix = function(out){
    return Mat4.copy(this._matrix[this._matrixMode],out);
};

Context.prototype.pushMatrix = function(){
    this._matrixStack[this._matrixMode].push(Mat4.copy(this._matrix[this._matrixMode]));
};

Context.prototype.popMatrix = function(){
    this._matrix[this._matrixMode] = this._matrixStack[this._matrixMode].pop();
};

Context.prototype.identity = function(){
    Mat4.identity(this._matrix[this._matrixMode]);
};


module.exports = Context;