var mat44 = require('../math/mat44');

var ProgramUniform = require('./ProgramUniform');


var MATRIX_PROJECTION = 0; // for now
var MATRIX_VIEW       = 1;
var MATRIX_MODEL      = 2;

var VIEWPORT_BIT     = 1 << 0;
var COLOR_BUFFER_BIT = null;
var DEPTH_BUFFER_BIT = null;

function Context(gl){
    this._gl = gl;

    this._viewport   = [0,0,0,0];
    this._viewportStack = [];

    this._clearColor = [0,0,0,0];

    this._depthTest = false;

    this._matrix = {};
    this._matrix[MATRIX_PROJECTION] = mat44.create();
    this._matrix[MATRIX_VIEW]       = mat44.create();
    this._matrix[MATRIX_MODEL]      = mat44.create();

    this._matrixStack = {};
    this._matrixStack[MATRIX_PROJECTION] = [];
    this._matrixStack[MATRIX_VIEW]       = [];
    this._matrixStack[MATRIX_MODEL]      = [];

    this._matrixUnifomMap = {};
    this._matrixUnifomMap[MATRIX_PROJECTION] = ProgramUniform.PROJECTION_MATRIX;
    this._matrixUnifomMap[MATRIX_VIEW]       = ProgramUniform.VIEW_MATRIX;
    this._matrixUnifomMap[MATRIX_MODEL]      = ProgramUniform.MODEL_MATRIX;

    this._matrixMode    = MATRIX_MODEL;
    this._matrixF32Temp = new Float32Array(16);

    this._program = null;
    this._programUniformLocations = null;
}

Context.prototype.push = function(mask){
    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        this._viewportStack.push(this._viewport.slice(0));
    }

};

Context.prototype.pop = function(){
    var prev;
    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        prev = this._viewportStack.pop();
        this._viewport = this._viewportStack.pop();
        this._gl.viewport(this._viewport[0])
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
    var _matrix = mat44.copy(matrix,this._matrix[MATRIX_PROJECTION]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.PROJECTION_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.setViewMatrix = function(matrix){
    var _matrix = mat44.copy(matrix,this._matrix[MATRIX_VIEW]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.VIEW_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.setModelMatrix = function(matrix){
    var _matrix = mat44.copy(matrix,this._matrix[MATRIX_MODEL]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[ProgramUniform.MODEL_MATRIX],false,this._matrixF32Temp);
};

Context.prototype.getProjectionMatrix = function(out){
    return mat44.copy(this._matrix[MATRIX_PROJECTION],out);
};

Context.prototype.getViewMatrix = function(out){
    return mat44.copy(this._matrix[MATRIX_VIEW],out);
};

Context.prototype.getModelMatrix = function(out){
    return mat44.copy(this._matrix[MATRIX_MODEL],out);
};

Context.prototype.setMatrixMode = function(matrixMode){
    this._matrixMode = matrixMode;
};

gl.push(gl.MODEL_MATRIX);

gl.setMatrixMode(gl.MODEL_MATRIX);
gl.pushMatrix();

gl.pushModelMatrix();

gl.multMatrix();
gl.translate
gl.scale
gl.rotate(Array|xzy')
gl.rotateY





Context.prototype.getMatrixMode = function(){
    return this._matrixMode;
};

Context.prototype.setMatrix = function(matrix){
    var _matrix = mat44.copy(matrix,this._matrix[this._matrixMode]);
    this._matrixF32Temp.set(_matrix);
    this._gl.uniformMatrix4fv(this._programUniformLocations[this._matrixUnifomMap[this._matrixMode]],this._matrixF32Temp);
};

Context.prototype.getMatrix = function(out){
    return mat44.copy(this._matrix[this._matrixMode],out);
};

Context.prototype.pushMatrix = function(){
    this._matrixStack[this._matrixMode].push(mat44.copy(this._matrix[this._matrixMode]));
};

Context.prototype.popMatrix = function(){
    this._matrix[this._matrixMode] = this._matrixStack[this._matrixMode].pop();
};


module.exports = Context;