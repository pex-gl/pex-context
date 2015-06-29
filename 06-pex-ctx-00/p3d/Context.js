var Mat4 = require('../math/Mat4');
var Vec2 = require('../math/Vec2');
var Vec3 = require('../math/Vec3');
var Vec4 = require('../math/Vec4');

var Program        = require('./Program');
var ProgramUniform = require('./ProgramUniform');
var ProgramAttributeLocation = require('./ProgramAttributeLocation');

var Buffer      = require('./Buffer');
var VertexArray = require('./VertexArray');

var Framebuffer = require('./Framebuffer');

var Texture2D   = require('./Texture2D');
var TextureCube   = require('./TextureCube');

var STR_ERROR_STACK_POP_BIT = 'Invalid pop. Bit %s stack is empty.';

//STATE BITS

var ALL_BIT        = (1 << 30) - 1;
var DEPTH_BIT      = 1 << 1;
var COLOR_BIT      = 1 << 2;
var STENCIL_BIT    = 1 << 3;
var VIEWPORT_BIT   = 1 << 4;
var SCISSOR_BIT    = 1 << 5;
var CULL_BIT       = 1 << 6;
var BLEND_BIT      = 1 << 7;
var ALPHA_BIT      = 1 << 8;
var LINE_WIDTH_BIT = 1 << 9;

var MATRIX_PROJECTION_BIT = 1 << 16;
var MATRIX_VIEW_BIT       = 1 << 17;
var MATRIX_MODEL_BIT      = 1 << 18;
var FRAMEBUFFER_BIT       = 1 << 19;
var BUFFER_BIT            = 1 << 20;
var VERTEX_ARRAY_BIT      = 1 << 21;
var PROGRAM_BIT           = 1 << 22;
var TEXTURE_BIT           = 1 << 23;
var XBO_BIT               = 1 << 24;

//UITLS

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

    this._mask      = -1;
    this._maskStack = [];

    this._bitMap = {};
    this._bitMap[DEPTH_BIT] = gl.DEPTH_BUFFER_BIT;
    this._bitMap[COLOR_BIT] = gl.COLOR_BUFFER_BIT;
    this._bitMap[DEPTH_BIT | COLOR_BIT] = gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT;

    this.ALL_BIT = ALL_BIT;

    this.DEPTH_BIT        = DEPTH_BIT;
    this._depthTest       = false;
    this._depthMask       = gl.getParameter(gl.DEPTH_WRITEMASK);
    this._depthFunc       = gl.getParameter(gl.DEPTH_FUNC);
    this._depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    this._depthRange      = glObjToArray(gl.getParameter(gl.DEPTH_RANGE)).slice(0,2);
    this._polygonOffset   = [gl.getParameter(gl.POLYGON_OFFSET_FACTOR),gl.getParameter(gl.POLYGON_OFFSET_UNITS)];

    this._depthStack = [[
        this._depthTest, this._depthMask, this._depthFunc,
        this._depthClearValue, this._depthRange.slice(0), Vec2.copy(this._polygonOffset)
    ]];

    this.COLOR_BIT   = COLOR_BIT;
    this._clearColor = [0, 0, 0, 1];
    this._colorMask  = gl.getParameter(gl.COLOR_WRITEMASK);
    this._colorStack = [[
        Vec4.copy(this._clearColor), Vec4.copy(this._colorMask)
    ]];

    this.SCISSOR_BIT   = SCISSOR_BIT;
    this._scissorTest  = gl.getParameter(gl.SCISSOR_TEST);
    this._scissorBox   = glObjToArray(gl.getParameter(gl.SCISSOR_BOX)).slice(0,4);
    this._scissorStack = [[
        this._scissorTest, Vec4.copy(this._scissorBox)
    ]];

    this.VIEWPORT_BIT   = VIEWPORT_BIT;
    this._viewport      = glObjToArray(gl.getParameter(gl.VIEWPORT)).slice(0,4);
    this._viewportStack = [Vec4.copy(this._viewport)];

    this.STENCIL_BIT          = STENCIL_BIT;
    this._stencilTest         = gl.getParameter(gl.STENCIL_TEST);
    this._stencilFunc         = gl.getParameter(gl.STENCIL_FUNC);
    this._stencilFuncSeparate = null;
    this._stencilOp           = null;
    this._stencilOpSeparate   = null;
    this._stenciStack = [[
        this._stencilTest, this._stencilFunc, this._stencilFuncSeparate, this._stencilOp, this._stencilOpSeparate
    ]];

    this.CULL_BIT = CULL_BIT;

    this.BLEND_BIT              = BLEND_BIT;
    this._blend                 = gl.getParameter(gl.BLEND);
    this._blendColor            = gl.getParameter(gl.BLEND_COLOR);
    this._blendEquation         = gl.getParameter(gl.BLEND_EQUATION);
    this._blendEquationSeparate = [gl.getParameter(gl.BLEND_EQUATION_RGB),gl.getParameter(gl.BLEND_EQUATION_ALPHA)];
    this._blendFunc             = null;
    this._blendStack = [[
        this._blend,this._blendColor,this._blendEquation,Vec2.copy(this._blendEquationSeparate),this._blendFunc
    ]];

    this.ALPHA_BIT = ALPHA_BIT;

    this.LINE_WIDTH_BIT  = LINE_WIDTH_BIT;
    this._lineWidth      = gl.getParameter(gl.LINE_WIDTH);
    this._lineWidthStack = [this._lineWidth];

    this.MATRIX_PROJECTION_BIT = MATRIX_PROJECTION_BIT;
    this.MATRIX_VIEW_BIT       = MATRIX_VIEW_BIT;
    this.MATRIX_MODEL_BIT      = MATRIX_MODEL_BIT;
    this._matrix = {};
    this._matrix[MATRIX_PROJECTION_BIT] = Mat4.create();
    this._matrix[MATRIX_VIEW_BIT]       = Mat4.create();
    this._matrix[MATRIX_MODEL_BIT]      = Mat4.create();

    this._matrixStack = {};
    this._matrixStack[MATRIX_PROJECTION_BIT] = [this._matrix[MATRIX_PROJECTION_BIT]];
    this._matrixStack[MATRIX_VIEW_BIT]       = [this._matrix[MATRIX_VIEW_BIT]];
    this._matrixStack[MATRIX_MODEL_BIT]      = [this._matrix[MATRIX_MODEL_BIT]];

    this._matrixUniformBitMap = {};
    this._matrixUniformBitMap[ProgramUniform.PROJECTION_MATRIX] = MATRIX_PROJECTION_BIT;
    this._matrixUniformBitMap[ProgramUniform.VIEW_MATRIX]       = MATRIX_VIEW_BIT;
    this._matrixUniformBitMap[ProgramUniform.MODEL_MATRIX]      = MATRIX_MODEL_BIT;

    this._matrixMode    = MATRIX_MODEL_BIT;
    this._matrixF32Temp = new Float32Array(16);

    this._matrixSend = {};
    this._matrixSend[MATRIX_PROJECTION_BIT] = false;
    this._matrixSend[MATRIX_VIEW_BIT]       = false;
    this._matrixSend[MATRIX_MODEL_BIT]      = false;

    this.PROGAM_BIT = PROGRAM_BIT;
    this._program = null;
    this._programMatrixUniformBits = {};
    this._programStack = [this._program];

    this.BUFFER_BIT = BUFFER_BIT;
    this._bufferPrev = {};
    this._bufferPrev[gl.ARRAY_BUFFER] = null;
    this._bufferPrev[gl.ELEMENT_ARRAY_BUFFER] = null;
    this._buffer = {};
    this._buffer[gl.ARRAY_BUFFER] = null;
    this._buffer[gl.ELEMENT_ARRAY_BUFFER] = null;

    this.VERTEX_ARRAY_BIT = VERTEX_ARRAY_BIT;
    this._vertexArray = null;
    this._vertexArrayHasIndexBuffer = false;
    this._vertexArrayIndexBufferDataType = null;
    this._vertexArrayHasDivisor = false;
    this._vertexArrayStack = [this._vertexArray];

    this.TEXTURE_BIT = TEXTURE_BIT;
    this._maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this._textures = new Array(this._maxTextureImageUnits);
    this._textureStack = [ this._textures.slice(0) ];

    this.LINE_WIDTH_BIT = LINE_WIDTH_BIT;
    this._lineWidth = gl.getParameter(gl.LINE_WIDTH);
    this._lineWidthStack = [this._lineWidth];

    this.ATTRIB_POSITION    = ProgramAttributeLocation.POSITION;
    this.ATTRIB_COLOR       = ProgramAttributeLocation.COLOR;
    this.ATTRIB_TEX_COORD_0 = ProgramAttributeLocation.TEX_COORD_0;
    this.ATTRIB_TEX_COORD_1 = ProgramAttributeLocation.TEX_COORD_1;
    this.ATTRIB_TEX_COORD_2 = ProgramAttributeLocation.TEX_COORD_2;
    this.ATTRIB_TEX_COORD_3 = ProgramAttributeLocation.TEX_COORD_3;
    this.ATTRIB_NORMAL      = ProgramAttributeLocation.NORMAL;
    this.ATTRIB_TANGENT     = ProgramAttributeLocation.TANGENT;
    this.ATTRIB_BITANGENT   = ProgramAttributeLocation.BITANGENT;
    this.ATTRIB_BONE_INDEX  = ProgramAttributeLocation.BONE_INDEX;
    this.ATTRIB_BONE_WEIGHT = ProgramAttributeLocation.BONE_WEIGHT;
    this.ATTRIB_CUSTOM_0    = ProgramAttributeLocation.CUSTOM_0;
    this.ATTRIB_CUSTOM_1    = ProgramAttributeLocation.CUSTOM_1;
    this.ATTRIB_CUSTOM_2    = ProgramAttributeLocation.CUSTOM_2;
    this.ATTRIB_CUSTOM_3    = ProgramAttributeLocation.CUSTOM_3;
    this.ATTRIB_CUSTOM_4    = ProgramAttributeLocation.CUSTOM_4;

    //Data Types
    this.FLOAT          = gl.FLOAT;
    this.UNSIGNED_SHORT = gl.UNSIGNED_SHORT;
    this.UNSIGNED_INT   = gl.UNSIGNED_INT;

    //Texture Formats
    this.RGBA           = gl.RGBA;
    this.DEPTH_COMPONENT= gl.DEPTH_COMPONENT;
    this.NEAREST        = gl.NEAREST;
    this.LINEAR         = gl.LINEAR;
    this.NEAREST_MIPMAP_NEAREST = gl.NEAREST_MIPMAP_NEAREST;
    this.NEAREST_MIPMAP_LINEAR  = gl.NEAREST_MIPMAP_LINEAR;
    this.LINEAR_MIPMAP_NEAREST  = gl.LINEAR_MIPMAP_NEAREST;
    this.LINEAR_MIPMAP_LINEAR   = gl.LINEAR_MIPMAP_LINEAR;

    //Texture Targets
    this.TEXTURE_2D = gl.TEXTURE_2D;
    this.TEXTURE_CUBE_MAP_POSITIVE_X = gl.TEXTURE_CUBE_MAP_POSITIVE_X;
    this.TEXTURE_CUBE_MAP_NEGATIVE_X = gl.TEXTURE_CUBE_MAP_NEGATIVE_X;
    this.TEXTURE_CUBE_MAP_POSITIVE_Y = gl.TEXTURE_CUBE_MAP_POSITIVE_Y;
    this.TEXTURE_CUBE_MAP_NEGATIVE_Y = gl.TEXTURE_CUBE_MAP_NEGATIVE_Y;
    this.TEXTURE_CUBE_MAP_POSITIVE_Z = gl.TEXTURE_CUBE_MAP_POSITIVE_Z;
    this.TEXTURE_CUBE_MAP_NEGATIVE_Z = gl.TEXTURE_CUBE_MAP_NEGATIVE_Z;

    //Vertex Array
    this.STATIC_DRAW    = gl.STATIC_DRAW;
    this.DYNAMIC_DRAW   = gl.DYNAMIC_DRAW;
    this.ARRAY_BUFFER   = gl.ARRAY_BUFFER;
    this.ELEMENT_ARRAY_BUFFER = gl.ELEMENT_ARRAY_BUFFER;

    //Primitive Types
    this.POINTS         = gl.POINTS;
    this.LINES          = gl.LINES;
    this.LINE_STRIP     = gl.LINE_STRIP;
    this.LINE_LOOP      = gl.LINE_LOOP;
    this.TRIANGLES      = gl.TRIANGLES;
    this.TRIANGLE_STRIP = gl.TRIANGLE_STRIP;
    this.TRIANGLE_FAN   = gl.TRIANGLE_FAN;
}

Context.prototype.getGL = function(){
    return this._gl;
};

Context.prototype.pushState = function(mask){
    mask = mask === undefined ? ALL_BIT : mask;

    if((mask & DEPTH_BIT) == DEPTH_BIT){
        this._depthStack.push([
            this._depthTest, this._depthMask, this._depthFunc, this._depthClearValue, Vec2.copy(this._depthRange), Vec2.copy(this._polygonOffset)
        ]);
    }

    if((mask & COLOR_BIT) == COLOR_BIT){
        this._colorStack.push([Vec4.copy(this._clearColor), Vec4.copy(this._colorMask)]);
    }

    if((mask & STENCIL_BIT) == STENCIL_BIT){

    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        this._viewportStack.push(Vec4.copy(this._viewport));
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        this._scissorStack.push([this._scissorTest, Vec4.copy(this._scissorBox)]);
    }

    if((mask & CULL_BIT) == CULL_BIT){

    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        this._lineWidthStack.push(this._lineWidth);
    }

    if((mask & PROGRAM_BIT) == PROGRAM_BIT){
        this._programStack.push(this._program);
    }

    if((mask & VERTEX_ARRAY_BIT) == VERTEX_ARRAY_BIT){
        this._vertexArrayStack.push(this._vertexArray);
    }

    if((mask & TEXTURE_BIT) == TEXTURE_BIT){
        this._textureStack.push(this._textures.slice(0));
    }

    this._mask = mask;
    this._maskStack.push(this._mask);
};

Context.prototype.popState = function(){
    var gl   = this._gl;
    var mask = this._mask = this._maskStack.pop();
    var prev;
    var stack;

    if((mask & DEPTH_BIT) == DEPTH_BIT){

    }

    if((mask & COLOR_BIT) == COLOR_BIT){
        if(this._colorStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','COLOR_BIT'));
        }
        stack = this._colorStack[this._colorStack.length - 1];

        prev = this._clearColor;
        this._clearColor = stack[0];
        if(!Vec4.equals(this._clearColor,prev)){
            gl.clearColor(this._clearColor[0],this._clearColor[1],this._clearColor[2],this._clearColor[3]);
        }

        prev = this._colorMask;
        this._colorMask = stack[1];
        if(!Vec4.equals(this._colorMask,prev)){
            gl.colorMask(this._colorMask[0],this._colorMask[1],this._colorMask[2],this._colorMask[3]);
        }
    }

    if((mask & DEPTH_BIT) == DEPTH_BIT){
        if(this._depthStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','DEPTH_BIT'));
        }
        stack = this._depthStack.pop();

        prev = this._depthTest;
        this._depthTest = stack[0];
        if(this._depthTest != prev){
            if(this._depthTest){
                gl.enable(gl.DEPTH_TEST);
            }
            else {
                gl.disable(gl.DEPTH_TEST);
            }
        }

        prev = this._depthMask;
        this._depthMask = stack[1];
        if(this._depthMask != prev){
            gl.depthMask(this._depthMask);
        }

        prev = this._depthFunc;
        this._depthFunc = stack[2];
        if(this._depthFunc != prev){
            gl.depthFunc(this._depthFunc);
        }

        prev = this._depthClearValue;
        this._depthClearValue = stack[3];
        if(this._depthClearValue != prev){
            gl.clearDepth(this._depthClearValue);
        }

        prev = this._depthRange;
        this._depthRange = stack[4];
        if(Vec2.equals(this._depthRange,prev)){
            gl.depthRange(this._depthRange[0],this._depthRange[1]);
        }

        prev = this._polygonOffset;
        this._polygonOffset = stack[5];
        if(Vec2.equals(this._polygonOffset,prev)){
            gl.polygonOffset(this._polygonOffset[0],this._polygonOffset[1]);
        }
    }

    if((mask & STENCIL_BIT) == STENCIL_BIT){

    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        if(this._viewportStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','VIEWPORT_BIT'));
        }

        prev = this._viewport;
        this._viewport = this._viewportStack.pop();
        if(!Vec4.equals(this._viewport,prev)){
            this._gl.viewport(this._viewport[0],this._viewport[1],this._viewport[2],this._viewport[3]);
        }
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        if(this._scissorStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','SCISSOR_BIT'));
        }
        stack = this._scissorStack.pop();

        prev = this._scissorTest;
        this._scissorTest = stack[0];

        if(this._scissorTest != prev){
            if(this._scissorTest){
                gl.enable(gl.SCISSOR_TEST)
            }
            else {
                gl.disable(gl.SCISSOR_TEST);
            }
        }

        prev = this._scissorBox;
        this._scissorBox  = stack[1];

        if(!Vec4.equals(this._scissorBox,prev)){
            gl.scissor(this._scissorBox[0],this._scissorBox[1],this._scissorBox[2],this._scissorBox[3]);
        }
    }

    if((mask & CULL_BIT) == CULL_BIT){

    }

    if((mask & BLEND_BIT) == BLEND_BIT){

    }

    if((mask & ALPHA_BIT) == ALPHA_BIT){

    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        if(this._lineWidthStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','LINE_WIDTH_BIT'));
        }
        prev = this._lineWidth;
        this._lineWidth = this._lineWidthStack.pop();
        if(this._lineWidth != prev){
            gl.lineWidth(this._lineWidth);
        }
    }

    if((mask & PROGRAM_BIT) == PROGRAM_BIT){

    }

    if((mask & VERTEX_ARRAY_BIT) == VERTEX_ARRAY_BIT){
        if(this._vertexArrayStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','VERTEX_ARRAY_BIT'));
        }
        this.bindVertexArray(this._vertexArrayStack.pop());
    }

    if((mask & TEXTURE_BIT) == TEXTURE_BIT){
        if(this._textureStack.length == 1){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','TEXTURE_BIT'));
        }
        prev = this._textures;
        stack = this._textureStack.pop();
        for(var i = 0; i < stack.length; i++) {
            if (prev[i] && (prev[i] != stack[i])) {
                gl.activeTexture(gl.TEXTURE0 + i);
                stack[i]._bindInternal();
            }
        }
    }
};

Context.prototype.getState = function(mask){
    mask = mask === undefined ? ALL_BIT : mask;

    var state = [];

    if((mask & DEPTH_BIT) == DEPTH_BIT){
        state.push([
            this._depthTest, this._depthMask, this._depthFunc, this._depthClearValue, Vec2.copy(this._depthRange), Vec2.copy(this._polygonOffset)
        ]);
    }

    if((mask & COLOR_BIT) == COLOR_BIT){
        state.push([Vec4.copy(this._clearColor), Vec4.copy(this._colorMask)]);
    }

    if((mask & DEPTH_BIT) == DEPTH_BIT){

    }

    if((mask & STENCIL_BIT) == STENCIL_BIT){

    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        state.push(Vec4.copy(this._viewport));
    }

    if((mask && SCISSOR_BIT) == SCISSOR_BIT){
        state.push([this._scissorTest, this._scissorStack]);
    }

    if((mask & CULL_BIT) == CULL_BIT){

    }

    if((mask & BLEND_BIT) == BLEND_BIT){

    }

    if((mask & ALPHA_BIT) == ALPHA_BIT){

    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        state.push(this._lineWidth);
    }

    if((mask && PROGRAM_BIT) == PROGRAM_BIT){
        state.push(this._program);
    }

    return state.length > 1 ? state : state[0];

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

Context.prototype.setScissorTest = function(scissor){
    if(scissor == this._scissorTest){
        return;
    }
    scissor ? this._gl.enable(this._gl.SCISSOR_TEST) : this._gl.disable(this._gl.SCISSOR_TEST);
    this._scissorTest = scissor;
};

Context.prototype.getScissorTest = function(){
    return this._scissorTest
};

Context.prototype.setScissor = function(x,y,w,h){
    if(Vec4.equals4(this._scissorBox,x,y,w,h)){
        return;
    }
    this._gl.scissor(x,y,w,h);
    Vec4.set4(this._scissorBox,x,y,w,h);
};

Context.prototype.getScissor = function(out){
    return Vec4.copy(this._scissorBox,out);
};

Context.prototype.setClearColor = function(r,g,b,a){
    if(Vec4.equals4(this._clearColor,r,g,b,a)){
        return;
    }
    this._gl.clearColor(r,g,b,a);
    Vec4.set4(this._clearColor,r,g,b,a);
};

Context.prototype.getClearColor = function(out){
    return Vec4.copy(this._clearColor,out);
};

Context.prototype.setDepthTest = function(depthTest){
    if(depthTest ===this._depthTest){
        return;
    }
    if(depthTest){
        this._gl.enable(this._gl.DEPTH_TEST);
    }
    else {
        this._gl.disable(this._gl.DEPTH_TEST);
    }
    this._depthTest = depthTest;
};

Context.prototype.getDepthTest = function(){
    return this._depthTest;
};

Context.prototype.setDepthMask = function(flag){
    if(flag == this._depthMask){
        return;
    }
    this._gl.depthMask(flag);
    this._depthMask = flag;
};

Context.prototype.getDepthMask = function(){
    return this._depthMask;
};

Context.prototype.setDepthFunc = function(func){
    if(func == this._depthFunc){
        return;
    }
    this._gl.depthFunc(func);
    this._depthFunc = func;
};

Context.prototype.getDepthFunc = function(){
    return this._depthFunc;
};

Context.prototype.setClearDepth = function(depth){
    if(depth == this._depthClearValue){
        return;
    }
    this._gl.clearDepth(depth);
    this._depthClearValue = depth;
};

Context.prototype.getClearDepth = function(){
    return this._depthClearValue;
};

Context.prototype.setDepthRange = function(znear,zfar){
    if(Vec2.equals2(this._depthRange,znear,zfar)){
        return;
    }
    this._gl.depthRange(znear,zfar);
    this._depthRange[0] = znear;
    this._depthRange[1] = zfar;
};

Context.prototype.getDepthRange = function(out){
    return Vec2.copy(this._depthRange,out);
};

Context.prototype.setPolygonOffset = function(factor,units){
    if(Vec2.equals(this._polygonOffset,factor,units)){
        return;
    }
    this._gl.polygonOffset(factor,units);
    this._polygonOffset[0] = factor;
    this._polygonOffset[1] = units;
};

Context.prototype.getPolygonOffset = function(out){
    return Vec2.copy(this._polygonOffset,out);
};

Context.prototype.setLineWidth = function(lineWidth){
    if(this._lineWidth == lineWidth){
        return;
    }
    this._gl.lineWidth(lineWidth);
    this._lineWidth = lineWidth;
};

Context.prototype.getLineWidth = function(){
    return this._lineWidth;
};

Context.prototype.clear = function(mask){
    this._gl.clear(this._bitMap[mask]);
};

Context.prototype.setProjectionMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_PROJECTION_BIT],matrix);
    this._matrixSend[MATRIX_PROJECTION_BIT] = false;
};

Context.prototype.setViewMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_VIEW_BIT],matrix);
    this._matrixSend[MATRIX_VIEW_BIT] = false;
};

Context.prototype.setModelMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_MODEL_BIT],matrix);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
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

Context.prototype.pushProjectionMatrix = function(){
    this._matrixStack[MATRIX_PROJECTION_BIT].push(Mat4.copy(this._matrix[MATRIX_PROJECTION_BIT]));
};

Context.prototype.popProjectionMatrix = function(){
    this._matrix[MATRIX_PROJECTION_BIT] = this._matrixStack[MATRIX_PROJECTION_BIT].pop();
    this._matrixSend[MATRIX_PROJECTION_BIT] = false;
};

Context.prototype.pushViewMatrix = function(){
    this._matrixStack[MATRIX_VIEW_BIT].push(Mat4.copy(this._matrix[MATRIX_VIEW_BIT]));
};

Context.prototype.popViewMatrix = function(){
    this._matrix[MATRIX_VIEW_BIT] = this._matrixStack[MATRIX_VIEW_BIT].pop();
    this._matrixSend[MATRIX_VIEW_BIT] = false;
};

Context.prototype.pushModelMatrix = function(){
    this._matrixStack[MATRIX_MODEL_BIT].push(Mat4.copy(this._matrix[MATRIX_MODEL_BIT]));
};

Context.prototype.popModelMatrix = function(){
    this._matrix[MATRIX_MODEL_BIT] = this._matrixStack[MATRIX_MODEL_BIT].pop();
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.identity = function(){
    Mat4.identity(this._matrix[MATRIX_MODEL_BIT]);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.scale = function(v){
    Mat4.scale(this._matrix[MATRIX_MODEL_BIT],v);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.translate = function(v){
    Mat4.translate(this._matrix[MATRIX_MODEL_BIT],v);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.rotate = function(r,v){
    Mat4.rotate(this._matrix[MATRIX_MODEL_BIT],r,v);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.rotateXYZ = function(v){
    Mat4.rotateXYZ(this._matrix[MATRIX_MODEL_BIT],v);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.multMatrix = function(m){
    Mat4.mult(this._matrix[MATRIX_MODEL_BIT],m);
    this._matrixSend[MATRIX_MODEL_BIT] = false;
};

Context.prototype.createProgram = function(vertSrc, fragSrc, attributeLocationMap){
    return new Program(this, vertSrc, fragSrc, attributeLocationMap);
};

Context.prototype.bindProgram = function(program) {
    if(program === this._program){
        return;
    }
    program._bindInternal();
    this._program = program;
    this._matrixSend[MATRIX_PROJECTION_BIT] = false;
    this._matrixSend[MATRIX_VIEW_BIT]       = false;
    this._matrixSend[MATRIX_MODEL_BIT]      = false;

    this._programMatrixUniformBits = {};
    for(var entry in ProgramUniform){
        var uniformName = ProgramUniform[entry];
        if(program.hasUniform(uniformName)){
            this._programMatrixUniformBits[uniformName] = this._matrixUniformBitMap[uniformName];
        }
    }
};

Context.prototype.getProgram = function(){
    return this._program;
};

Context.prototype.createBuffer = function(target, sizeOrData, usage, preserveData) {
    return new Buffer(this, target, sizeOrData, usage, preserveData);
};

Context.prototype._bindBuffer = function(buffer){
    var target = buffer.getTarget();
    this._bufferPrev[target] = this._buffer[target];

    if(buffer !== this._buffer[target]){
        this._gl.bindBuffer(target,buffer._getHandle());
    }

    this._buffer[target] = buffer;
};

Context.prototype._unbindBuffer = function(buffer){
    var target = buffer.getTarget();
    var bufferPrev = this._bufferPrev[target];

    if(this._buffer[target] !== bufferPrev){
        this._gl.bindBuffer(target, bufferPrev !== null ? bufferPrev._getHandle() : bufferPrev);
    }

    this._buffer[target] = bufferPrev;
};

Context.prototype.createVertexArray = function(attributes, indexBuffer) {
    return new VertexArray(this, attributes, indexBuffer);
};

Context.prototype.bindVertexArray = function(vertexArray) {
    if(vertexArray === this._vertexArray){
        return;
    }

    vertexArray._bindInternal();

    this._vertexArray = vertexArray;
    this._vertexArrayHasIndexBuffer = vertexArray.hasIndexBuffer();
    this._vertexArrayIndexBufferDataType = this._vertexArrayHasIndexBuffer ? vertexArray.getIndexBuffer().getDataType() : null;
    this._vertexArrayHasDivisor = vertexArray.hasDivisor();
};

Context.prototype.getVertexArray = function(){
    return this._vertexArray;
};

Context.prototype.createTexture2D = function(data, width, height, options) {
    return new Texture2D(this, data, width, height, options);
};

Context.prototype.createTextureCube = function(facesData, width, height, options) {
    return new TextureCube(this, facesData, width, height, options);
};

Context.prototype.bindTexture = function(texture, textureUnit) {
    var gl = this._gl;
    textureUnit = textureUnit || 0; //TODO: What about this check?
    if (this._textures[textureUnit] != texture) {
        this._textures[textureUnit] = texture;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        texture._bindInternal();
    }
};

Context.prototype.createFramebuffer = function(colorAttachments, depthAttachment) {
    return new Framebuffer(this, colorAttachments, depthAttachment);
};

Context.prototype.bindFramebuffer = function(framebuffer) {
    //TODO: implement framebuffer state stack
    if (framebuffer) {
        framebuffer._bindInternal();
    }
    else {
        var gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
};

Context.prototype.draw = function(mode, first, count){
    var programMatrixBitUniforms = this._programMatrixUniformBits;

    for(var uniformName in programMatrixBitUniforms){
        var matrixBit = programMatrixBitUniforms[uniformName];
        if(!this._matrixSend[matrixBit]){
            this._matrixF32Temp.set(this._matrix[matrixBit]);
            this._program.setUniform(uniformName,this._matrixF32Temp);
            this._matrixSend[matrixBit] = true;
        }
    }

    if (this._vertexArrayHasIndexBuffer) {
        if (this._vertexArrayHasDivisor) {
            //FIXME: Hardcoded num of instances
            this._gl.drawElementsInstanced(mode, count, this._vertexArrayIndexBufferDataType, 0, 1000);
        }
        else {
            this._gl.drawElements(mode, count, this._vertexArrayIndexBufferDataType, first);
        }
    }
    else {
        if (this._vertexArrayHasDivisor) {
            //FIXME: Hardcoded num of instances
            this._gl.drawArraysInstanced(mode, first, count, 1000);
        }
        else {
            this._gl.drawArrays(mode, first, count);
        }

    }
};

module.exports = Context;
