var Mat4 = require('../math/Mat4');
var Vec2 = require('../math/Vec2');
var Vec3 = require('../math/Vec3');
var Vec4 = require('../math/Vec4');

var ProgramUniform = require('./ProgramUniform');

var STR_ERROR_STACK_POP_BIT = 'Invalid pop. Bit %s stack is empty.';

//STATE BITS

var ALL_BIT          = 1 << 0;
var DEPTH_BIT        = 1 << 1;
var COLOR_BIT        = 1 << 2;
var STENCIL_BIT      = 1 << 3;
var VIEWPORT_BIT     = 1 << 4;
var SCISSOR_BIT      = 1 << 5;

var COLOR_BUFFER_BIT = null;
var DEPTH_BUFFER_BIT = null;

var MATRIX_PROJECTION_BIT = 1 << 16;
var MATRIX_VIEW_BIT       = 1 << 17;
var MATRIX_MODEL_BIT      = 1 << 18;

//
function glObjToArray(obj){
    if(Array.isArray(obj)){
        return obj;
    }
    var out = new Array(Object.keys(obj).length);
    for(var entry in obj){
        out[+entry] = obj[entry];
    }
    return out;
}

function Context(gl){
    this._gl = gl;

    this._mask = -1;
    this._maskStack = [];

    this._bitMap = {};
    this._bitMap[DEPTH_BIT] = gl.DEPTH_BUFFER_BIT;
    this._bitMap[COLOR_BIT] = gl.COLOR_BUFFER_BIT;
    this._bitMap[DEPTH_BIT | COLOR_BIT] = gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT;

    this._depthTest       = false;
    this._depthMask       = gl.getParameter(gl.DEPTH_WRITEMASK);
    this._depthFunc       = gl.getParameter(gl.DEPTH_FUNC);
    this._depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    this._depthRange      = glObjToArray(gl.getParameter(gl.DEPTH_RANGE));
    this._polygonOffset   = [gl.getParameter(gl.POLYGON_OFFSET_FACTOR),gl.getParameter(gl.POLYGON_OFFSET_UNITS)];

    this._depthStack = [[
        this._depthTest, this._depthMask, this._depthFunc,
        this._depthClearValue, this._depthRange, Vec2.copy(this._polygonOffset)
    ]];

    this._clearColor = [0, 0, 0, 1];
    this._colorMask  = gl.getParameter(gl.COLOR_WRITEMASK);
    this._colorStack = [[ Vec4.copy(this._clearColor), Vec4.copy(this._colorMask)
    ]];

    this._scissorTest  = gl.getParameter(gl.SCISSOR_TEST);
    this._scissorBox   = glObjToArray(gl.getParameter(gl.SCISSOR_BOX)).slice(0,4);
    this._scissorStack = [[
        this._scissorTest, Vec4.copy(this._scissorBox)
    ]];

    this._viewport      = [0,0,0,0];
    this._viewportStack = [[ Vec4.copy(this._viewport) ]];

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



    this.ALL_BIT      = ALL_BIT;
    this.DEPTH_BIT    = DEPTH_BIT;
    this.COLOR_BIT    = COLOR_BIT;
    this.STENCIL_BIT  = STENCIL_BIT;
    this.VIEWPORT_BIT = VIEWPORT_BIT;
    this.SCISSOR_BIT  = SCISSOR_BIT;

    this.MATRIX_PROJECTION_BIT = MATRIX_PROJECTION_BIT;
    this.MATRIX_VIEW_BIT       = MATRIX_VIEW_BIT;
    this.MATRIX_MODEL_BIT      = MATRIX_MODEL_BIT;
}

Context.prototype.push = function(mask){
    mask = mask === undefined ? ALL_BIT : mask;

    if((mask & COLOR_BIT) == COLOR_BIT || mask == ALL_BIT){
        this._colorStack.push([Vec4.copy(this._clearColor), Vec4.copy(this._colorMask)]);
    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT || mask == ALL_BIT){
        this._viewportStack.push(Vec4.copy(this._viewport.slice(0)));
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT || mask == ALL_BIT){
        this._scissorStack.push([this._scissorTest, this._scissorStack]);
    }

    this._mask = mask;
    this._maskStack.push(this._mask);
};

Context.prototype.pop = function(){
    var gl   = this._gl;
    var mask = this._mask = this._maskStack.pop();
    var prev;
    var stack;

    if((mask & COLOR_BIT) == COLOR_BIT || mask == ALL_BIT){
        if(this._colorStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','COLOR_BIT'));
        }
        prev  = this._colorStack.pop();
        stack = this._colorStack[this._colorStack.length - 1];

        this._clearColor = stack[0];
        this._colorMask  = stack[1];

        if(!Vec4.equals(this._clearColor,prev[0])){
            gl.clearColor(this._clearColor[0],this._clearColor[1],this._clearColor[2],this._clearColor[3]);
        }
        if(!Vec4.equals(this._colorMask,prev[1])){
            gl.colorMask(this._colorMask[0],this._colorMask[1],this._colorMask[2],this._colorMask[3]);
        }
    }

    if((mask & DEPTH_BIT) == DEPTH_BIT){
        if(this._depthStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','DEPTH_BIT'));
        }
    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT || mask == ALL_BIT){
        if(this._viewportStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','VIEWPORT_BIT'));
        }
        prev = this._viewportStack.pop();
        this._viewport = this._viewportStack[this._viewportStack.length - 1];

        if(!Vec4.equals(this._viewport,prev)){
            this._gl.viewport(this._viewport[0],this._viewport[1],this._viewport[2],this._viewport[3]);
        }
    }

    if((mask && SCISSOR_BIT) == SCISSOR_BIT || mask == ALL_BIT){
        if(this._scissorStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','SCISSOR_BIT'));
        }
        prev  = this._scissorStack.pop();
        stack = this._scissorStack[this._scissorStack.length - 1];

        this._scissorTest = stack[0];
        this._scissorBox  = stack[1];

        if(this._scissorTest != prev[0]){
            this._scissorTest ? gl.enable(gl.SCISSOR_TEST) : gl.disable(gl.SCISSOR_TEST);
        }
        if(!Vec4.equals(this._scissorBox,prev[1])){
            gl.scissor(this._scissorBox[0],this._scissorBox[1],this._scissorBox[2],this._scissorBox[3]);
        }
    }
};

Context.prototype.setViewport = function(x,y,width,height){
    if(Vec4.equals4(this._viewport,x,y,width,height)){
        return;
    }
    Vec4.set4(this._viewport,x,y,width,height);
    this._gl.viewport(x,y,width,height);
};

Context.prototype.getViewport = function(out){
    return Vec4.copy(this._viewport,out);
};

Context.prototype.setClearColor = function(r,g,b,a){
    if(Vec4.equals4(r,g,b,a)){
        return;
    }
    Vec4.set4(this._clearColor,r,g,b,a);
    this._gl.clearColor(r,g,b,a);
};

Context.prototype.getClearColor = function(out){
    return Vec4.copy(this._clearColor,out);
};

Context.prototype.setDepthTest = function(depthTest){
    this._depthTest = depthTest;
};

Context.prototype.getDepthTest = function(){
    return this._depthTest;
};

Context.prototype.clear = function(mask){
    this._gl.clear(this._bitMap[mask]);
};

Context.prototype.bindProgram = function(program){
    //this._programUniformLocations = program.getUniformLocations();

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