var Mat3 = require('pex-math/Mat3');
var Mat4 = require('pex-math/Mat4');
var Vec2 = require('pex-math/Vec2');
var Vec3 = require('pex-math/Vec3');
var Vec4 = require('pex-math/Vec4');

var Program        = require('./Program');
var ProgramUniform = require('./ProgramUniform');
var ProgramAttributeLocation = require('./ProgramAttributeLocation');

var Buffer      = require('./Buffer');
var VertexArray = require('./VertexArray');
var Mesh        = require('./Mesh');

var Framebuffer = require('./Framebuffer');

var Texture2D   = require('./Texture2D');
var TextureCube = require('./TextureCube');

var isBrowser   = require('is-browser');
var isPlask     = !isBrowser;

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
var LINE_WIDTH_BIT = 1 << 8;

var MATRIX_PROJECTION_BIT = 1 << 16;
var MATRIX_VIEW_BIT       = 1 << 17;
var MATRIX_MODEL_BIT      = 1 << 18;
var FRAMEBUFFER_BIT       = 1 << 19;
var VERTEX_ARRAY_BIT      = 1 << 21;
var PROGRAM_BIT           = 1 << 22;
var TEXTURE_BIT           = 1 << 23;
var MESH_BIT              = 1 << 24;

var MATRIX_PROJECTION    = 'matrixProjection';
var MATRIX_VIEW          = 'matrixView';
var MATRIX_MODEL         = 'matrixModel';
var MATRIX_NORMAL        = 'matrixNormal';
var MATRIX_INVERSE_VIEW  = 'matrixInverseView';

var CAPS_WEBGL2                    = 0;
var CAPS_INSTANCED_ARRAYS          = 1;
var CAPS_TEXTURE_FLOAT             = 2;
var CAPS_TEXTURE_FLOAT_LINEAR      = 3;
var CAPS_TEXTURE_HALF_FLOAT        = 4;
var CAPS_TEXTURE_HALF_FLOAT_LINEAR = 5;
var CAPS_DEPTH_TEXTURE             = 6;
var CAPS_SRGB                      = 7;
var CAPS_ELEMENT_INDEX_UINT        = 8;

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

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.ALL_BIT = ALL_BIT;

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.DEPTH_BIT        = DEPTH_BIT;
    this._depthTest       = false;
    this._depthMask       = gl.getParameter(gl.DEPTH_WRITEMASK);
    this._depthFunc       = gl.getParameter(gl.DEPTH_FUNC);
    this._depthClearValue = gl.getParameter(gl.DEPTH_CLEAR_VALUE);
    this._depthRange      = glObjToArray(gl.getParameter(gl.DEPTH_RANGE)).slice(0,2);
    this._polygonOffset   = [gl.getParameter(gl.POLYGON_OFFSET_FACTOR),gl.getParameter(gl.POLYGON_OFFSET_UNITS)];
    this._depthStack      = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.COLOR_BIT   = COLOR_BIT;
    this._clearColor = [0, 0, 0, 1];
    this._colorMask  = gl.getParameter(gl.COLOR_WRITEMASK);
    this._colorStack = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.SCISSOR_BIT   = SCISSOR_BIT;
    this._scissorTest  = gl.getParameter(gl.SCISSOR_TEST);
    this._scissorBox   = glObjToArray(gl.getParameter(gl.SCISSOR_BOX)).slice(0,4);
    this._scissorStack = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.VIEWPORT_BIT   = VIEWPORT_BIT;
    this._viewport      = glObjToArray(gl.getParameter(gl.VIEWPORT)).slice(0,4);
    this._viewportStack = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.STENCIL_BIT          = STENCIL_BIT;
    this._stencilTest         = gl.getParameter(gl.STENCIL_TEST);
    this._stencilFunc         = [gl.getParameter(gl.STENCIL_FUNC),gl.getParameter(gl.STENCIL_REF),0xFF];
    this._stencilFuncSeparate = [gl.FRONT,this._stencilFunc[0],gl.getParameter(gl.STENCIL_REF),this._stencilFunc[2]];
    this._stencilOp           = [gl.getParameter(gl.STENCIL_FAIL),gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL),gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS)];
    this._stencilOpSeparate   = [gl.FRONT,this._stencilOp[0],this._stencilOp[1],this._stencilOp[2]];
    this._stencilStack        = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.CULL_BIT      = CULL_BIT;
    this._cullFace      = gl.getParameter(gl.CULL_FACE);
    this._cullFaceMode = gl.getParameter(gl.CULL_FACE_MODE);
    this._cullStack    = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.BLEND_BIT              = BLEND_BIT;
    this._blend                 = gl.getParameter(gl.BLEND);
    this._blendColor            = glObjToArray(gl.getParameter(gl.BLEND_COLOR)).slice(0,4);
    this._blendEquation         = gl.getParameter(gl.BLEND_EQUATION);
    this._blendEquationSeparate = [gl.getParameter(gl.BLEND_EQUATION_RGB),gl.getParameter(gl.BLEND_EQUATION_ALPHA)];
    this._blendFunc             = [gl.ONE,gl.ZERO];
    this._blendFuncSeparate     = [gl.ZERO,gl.ZERO,gl.ZERO,gl.ZERO];
    this._blendStack            = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.LINE_WIDTH_BIT  = LINE_WIDTH_BIT;
    this._lineWidth      = gl.getParameter(gl.LINE_WIDTH);
    this._lineWidthStack = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.MATRIX_PROJECTION_BIT = MATRIX_PROJECTION_BIT;

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.MATRIX_VIEW_BIT       = MATRIX_VIEW_BIT;

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.MATRIX_MODEL_BIT      = MATRIX_MODEL_BIT;
    this._matrix = {};
    this._matrix[MATRIX_PROJECTION]   = Mat4.create();
    this._matrix[MATRIX_VIEW]         = Mat4.create();
    this._matrix[MATRIX_MODEL]        = Mat4.create();
    this._matrix[MATRIX_NORMAL]       = Mat3.create();
    this._matrix[MATRIX_INVERSE_VIEW] = Mat4.create();

    this._matrixStack = {};
    this._matrixStack[MATRIX_PROJECTION_BIT] = [];
    this._matrixStack[MATRIX_VIEW_BIT]       = [];
    this._matrixStack[MATRIX_MODEL_BIT]      = [];

    this._matrixTypeByUniformNameMap = {};
    this._matrixTypeByUniformNameMap[ProgramUniform.PROJECTION_MATRIX]   = MATRIX_PROJECTION;
    this._matrixTypeByUniformNameMap[ProgramUniform.VIEW_MATRIX]         = MATRIX_VIEW;
    this._matrixTypeByUniformNameMap[ProgramUniform.MODEL_MATRIX]        = MATRIX_MODEL;
    this._matrixTypeByUniformNameMap[ProgramUniform.NORMAL_MATRIX]       = MATRIX_NORMAL;
    this._matrixTypeByUniformNameMap[ProgramUniform.INVERSE_VIEW_MATRIX] = MATRIX_INVERSE_VIEW;

    this._matrix4Temp    = Mat4.create();
    this._matrix4F32Temp = new Float32Array(16);
    this._matrix3F32Temp = new Float32Array(9);

    this._matrixTempByTypeMap = {};
    this._matrixTempByTypeMap[MATRIX_PROJECTION] =
    this._matrixTempByTypeMap[MATRIX_VIEW] =
    this._matrixTempByTypeMap[MATRIX_MODEL] =
    this._matrixTempByTypeMap[MATRIX_INVERSE_VIEW] = this._matrix4F32Temp;
    this._matrixTempByTypeMap[MATRIX_NORMAL] = this._matrix3F32Temp;

    this._matrixSend = {};
    this._matrixSend[MATRIX_PROJECTION]  = false;
    this._matrixSend[MATRIX_VIEW]        = false;
    this._matrixSend[MATRIX_MODEL]       = false;
    this._matrixSend[MATRIX_NORMAL]      = false;
    this._matrixSend[MATRIX_INVERSE_VIEW]= false;

    this._matrixTypesByUniformInProgram = {};

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.PROGRAM_BIT = PROGRAM_BIT;
    this._program = null;
    this._programStack = [];

    this._bufferPrev = {};
    this._bufferPrev[gl.ARRAY_BUFFER] = null;
    this._bufferPrev[gl.ELEMENT_ARRAY_BUFFER] = null;
    this._buffer = {};
    this._buffer[gl.ARRAY_BUFFER] = null;
    this._buffer[gl.ELEMENT_ARRAY_BUFFER] = null;

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.VERTEX_ARRAY_BIT = VERTEX_ARRAY_BIT;
    this._vertexArray = null;
    this._vertexArrayHasIndexBuffer = false;
    this._vertexArrayIndexBufferDataType = null;
    this._vertexArrayHasDivisor = false;
    this._vertexArrayStack = [];

    /**
     * [BIT description here]
     * @type {Number}
     * @const
     */
    this.MESH_BIT = MESH_BIT;
    this._mesh = null;
    this._meshPrimitiveType = null;
    this._meshHasIndexBuffer = false;
    this._meshIndexBufferDataType = null;
    this._meshCount = 0;
    this._meshHasDivisor = false;
    this._meshStack = [];

    /**
     * [BIT description here]
     * @type {number}
     * @const
     */
    this.TEXTURE_BIT = TEXTURE_BIT;
    this._maxTextureImageUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this._textures = new Array(this._maxTextureImageUnits);
    this._textureStack = [];
    this.MAX_TEXTURE_IMAGE_UNITS = this._maxTextureImageUnits;

    /**
     * [BIT description here]
     * @type {number}
     * @const
     */
    this.FRAMEBUFFER_BIT = FRAMEBUFFER_BIT;
    this._framebuffer = null;
    this._framebufferStack = [];

    /**
     * [BIT description here]
     * @type {number}
     * @const
     */
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

    //Blend
    this.FUNC_ADD               = gl.FUNC_ADD;
    this.FUNC_SUBSTRACT         = gl.FUNC_SUBSTRACT;
    this.FUNC_REVERSE_SUBSTRACT = gl.FUNC_REVERSE_SUBSTRACT;
    this.ZERO                = gl.ZERO;
    this.ONE                 = gl.ONE;
    this.SRC_COLOR           = gl.SRC_COLOR;
    this.ONE_MINUS_SRC_COLOR = gl.ONE_MINUS_SRC_COLOR;
    this.DST_COLOR           = gl.DST_COLOR;
    this.ONE_MINUS_DST_COLOR = gl.ONE_MINUS_DST_COLOR;
    this.SRC_ALPHA           = gl.SRC_ALPHA;
    this.ONE_MINUS_SRC_ALPHA = gl.ONE_MINUS_SRC_ALPHA;
    this.DST_ALPHA           = gl.DST_ALPHA;
    this.ONE_MINUS_DST_ALPHA = gl.ONE_MINUS_DST_ALPHA;
    this.SRC_ALPHA_SATURATE  = gl.SRC_ALPHA_SATURATE;
    this.CONSTANT_COLOR           = gl.CONSTANT_COLOR;
    this.ONE_MINUS_CONSTANT_COLOR = gl.CONSTANT_COLOR;
    this.CONSTANT_ALPHA           = gl.CONSTANT_ALPHA;
    this.ONE_MINUS_CONSTANT_ALPHA = gl.ONE_MINUS_CONSTANT_ALPHA;

    //Culling
    this.FRONT          = gl.FRONT;
    this.BACK           = gl.BACK;
    this.FRONT_AND_BACK = gl.FRONT_AND_BACK;

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

    //Extensions and Capabilities

    this._caps = [];
    this.CAPS_WEBGL2                        = CAPS_WEBGL2;
    this.CAPS_INSTANCED_ARRAYS              = CAPS_INSTANCED_ARRAYS;
    this.CAPS_TEXTURE_FLOAT                 = CAPS_TEXTURE_FLOAT;
    this.CAPS_TEXTURE_FLOAT_LINEAR          = CAPS_TEXTURE_FLOAT_LINEAR;
    this.CAPS_TEXTURE_HALF_FLOAT            = CAPS_TEXTURE_HALF_FLOAT;
    this.CAPS_TEXTURE_HALF_FLOAT_LINEAR     = CAPS_TEXTURE_HALF_FLOAT_LINEAR;
    this.CAPS_DEPTH_TEXTURE                 = CAPS_DEPTH_TEXTURE;
    this.CAPS_SRGB                          = CAPS_SRGB;
    this.CAPS_ELEMENT_INDEX_UINT            = CAPS_ELEMENT_INDEX_UINT;

    //TODO: implement webgl 2 check
    var isWebGL2              = false;
    this._caps[CAPS_WEBGL2]   = isWebGL2;

    //ANGLE_instanced_arrays
    if (!gl.drawElementsInstanced) {
        var ext = gl.getExtension('ANGLE_instanced_arrays');
        if (!ext) {
            this._caps[CAPS_INSTANCED_ARRAYS] = false;
            gl.drawElementsInstanced = function() {
                throw new Error('ANGLE_instanced_arrays not supported');
            };
            gl.drawArraysInstanced = function() {
                throw new Error('ANGLE_instanced_arrays not supported');
            };
            gl.vertexAttribDivisor = function() {
                throw new Error('ANGLE_instanced_arrays not supported');
            };
        }
        else {
            this._caps[CAPS_INSTANCED_ARRAYS] = true;
            gl.drawElementsInstanced = function() {
                ext.drawElementsInstancedANGLE.apply(ext, arguments);
            };
            gl.drawArraysInstanced = function() {
                ext.drawArraysInstancedANGLE.apply(ext, arguments);
            };
            gl.vertexAttribDivisor = function() {
                ext.vertexAttribDivisorANGLE.apply(ext, arguments);
            };
        }
    }
    else {
        this._caps[CAPS_INSTANCED_ARRAYS] = true;
    }

    //OES_texture_float
    this._caps[CAPS_TEXTURE_FLOAT]             = isPlask || isWebGL2 || (gl.getExtension('OES_texture_float') != null);
    this._caps[CAPS_TEXTURE_FLOAT_LINEAR]      = isPlask || isWebGL2 || (gl.getExtension('OES_texture_float_linear') != null);
    this._caps[CAPS_TEXTURE_HALF_FLOAT]        = isPlask || isWebGL2 || (gl.getExtension('OES_texture_half_float') != null);
    this._caps[CAPS_TEXTURE_HALF_FLOAT_LINEAR] = isPlask || isWebGL2 || (gl.getExtension('OES_texture_half_float_linear') != null);

    //WEBGL_depth_texture
    this._caps[CAPS_DEPTH_TEXTURE]             = isPlask || isWebGL2 || (gl.getExtension('WEBGL_depth_texture') != null);

    //EXT_sRGB
    if (gl.SRGB) {
        this._caps[CAPS_SRGB] = true;
        this.SRGB         = gl.SRGB_EXT;
        this.SRGB8_ALPHA8 = gl.SRGB8_ALPHA8_EXT;
        this.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = gl.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING;
    }
    else {
        var ext = gl.getExtension('EXT_sRGB');
        if (ext) {
            this._caps[CAPS_SRGB] = true;
            this.SRGB         = ext.SRGB_EXT;
            this.SRGB8_ALPHA8 = ext.SRGB8_ALPHA8_EXT;
            this.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING = ext.FRAMEBUFFER_ATTACHMENT_COLOR_ENCODING_EXT;
        }
        else {
            this._caps[CAPS_SRGB] = false;
        }
    }

    if (isPlask || isWebGL2) {
        this._caps[CAPS_ELEMENT_INDEX_UINT] = true;
    }
    else {
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext) {
            this._caps[CAPS_ELEMENT_INDEX_UINT] = true;
        }
        else {
            this._caps[CAPS_ELEMENT_INDEX_UINT] = false;
        }
    }
}

/**
 * Returns the underlying gl context.
 * @returns {WebGLRenderingContext}
 */

Context.prototype.getGL = function(){
    return this._gl;
};

/**
 *
 * @param {Number} [mask]
 */

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
        this._stencilStack.push([this._stencilTest,Vec3.copy(this._stencilFunc),Vec4.copy(this._stencilFuncSeparate),Vec3.copy(this._stencilOp),Vec4.copy(this._stencilOpSeparate)]);
    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        this._viewportStack.push(Vec4.copy(this._viewport));
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        this._scissorStack.push([this._scissorTest, Vec4.copy(this._scissorBox)]);
    }

    if((mask & CULL_BIT) == CULL_BIT){
        this._cullStack.push([this._cullFace,this._cullFaceMode]);
    }

    if((mask & BLEND_BIT) == BLEND_BIT){
        this._blendStack.push([this._blend, Vec4.copy(this._blendColor), this._blendEquation, Vec2.copy(this._blendEquationSeparate), Vec2.copy(this._blendFunc), Vec4.copy(this._blendFuncSeparate)]);
    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        this._lineWidthStack.push(this._lineWidth);
    }

    if((mask & MATRIX_PROJECTION_BIT) == MATRIX_PROJECTION_BIT){
        this.pushProjectionMatrix();
    }

    if((mask & MATRIX_VIEW_BIT) == MATRIX_VIEW_BIT){
        this.pushViewMatrix();
    }

    if((mask & MATRIX_MODEL_BIT) == MATRIX_MODEL_BIT){
        this.pushModelMatrix();
    }

    if((mask & VERTEX_ARRAY_BIT) == VERTEX_ARRAY_BIT){
        this._vertexArrayStack.push(this._vertexArray);
    }

    if((mask & PROGRAM_BIT) == PROGRAM_BIT){
        this._programStack.push(this._program);
    }

    if((mask & TEXTURE_BIT) == TEXTURE_BIT){
        this._textureStack.push(this._textures.slice(0));
    }

    if((mask & FRAMEBUFFER_BIT) == FRAMEBUFFER_BIT){
        this._framebufferStack.push(this._framebuffer);
    }

    if((mask & MESH_BIT) == MESH_BIT){
        this._meshStack.push(this._mesh);
    }

    this._mask = mask;
    this._maskStack.push(this._mask);
};

/**
 *
 */

Context.prototype.popState = function(){
    var mask = this._mask = this._maskStack.pop();
    var stack, value;

    if((mask & COLOR_BIT) == COLOR_BIT){
        if(this._colorStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','COLOR_BIT'));
        }
        stack = this._colorStack[this._colorStack.length - 1];

        value = stack[0];
        this.setClearColor(value[0],value[1],value[2],value[3]);

        value = stack[1];
        this.setColorMask(value[0],value[1],value[2],value[3]);
    }

    if((mask & DEPTH_BIT) == DEPTH_BIT){
        if(this._depthStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','DEPTH_BIT'));
        }
        stack = this._depthStack.pop();

        this.setDepthTest(stack[0]);
        this.setDepthMask(stack[1]);
        this.setDepthFunc(stack[2]);
        this.setClearDepth(stack[3]);

        value = stack[4];
        this.setDepthRange(value[0],value[1]);

        value = stack[5];
        this.setPolygonOffset(value[0],value[1]);
    }

    if((mask & STENCIL_BIT) == STENCIL_BIT){
        if(this._stencilStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','STENCIL_BIT'));
        }
        stack = this._stencilStack.pop();

        this.setStencilTest(stack[0]);
        value = stack[1];
        this.setStencilFunc(value[0],value[1],value[2]);
        value = stack[2];
        this.setStencilFuncSeparate(value[0],value[1],value[2],value[3]);
        value = stack[3];
        this.setStencilOp(value[0],value[1],value[2]);
        value = stack[4];
        this.setStencilOpSeparate(value[0],value[1],value[2],value[3]);
    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        if(this._viewportStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','VIEWPORT_BIT'));
        }

        value = this._viewportStack.pop();
        this.setViewport(value[0],value[1],value[2],value[3]);
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        if(this._scissorStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','SCISSOR_BIT'));
        }
        stack = this._scissorStack.pop();

        this.setScissorTest(stack[0]);

        value = stack[1];
        this.setScissor(value[0],value[1],value[2],value[3]);
    }

    if((mask & CULL_BIT) == CULL_BIT){
        if(this._cullStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','CULL_BIT'));
        }
        stack = this._cullStack.pop();
        this.setCulling(stack[0]);
        this.setCullFace(stack[1]);
    }

    if((mask & BLEND_BIT) == BLEND_BIT){
        if(this._blendStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','BLEND_BIT'));
        }
        stack = this._blendStack.pop();

        this.setBlend(stack[0]);
        value = stack[1];
        this.setBlendColor(value[0],value[1],value[2],value[3]);
        this.setBlendEquation(stack[2]);
        value = stack[3];
        this.setBlendEquationSeparate(value[0],value[1]);
        value = stack[4];
        this.setBlendFunc(value[0],value[1]);
        value = stack[5];
        this.setBlendFuncSeparate(value[0],value[1],value[2],value[3]);
    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        if(this._lineWidthStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','LINE_WIDTH_BIT'));
        }
        value = this._lineWidthStack.pop();
        this.setLineWidth(value);
    }

    if((mask & MATRIX_PROJECTION_BIT) == MATRIX_PROJECTION_BIT){
        this.popProjectionMatrix();
    }

    if((mask & MATRIX_VIEW_BIT) == MATRIX_VIEW_BIT){
        this.popViewMatrix();
    }

    if((mask & MATRIX_MODEL_BIT) == MATRIX_MODEL_BIT){
        this.popModelMatrix();
    }

    if((mask & PROGRAM_BIT) == PROGRAM_BIT){
        if(this._programStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','PROGRAM_BIT'));
        }
        value = this._programStack.pop();
        this.bindProgram(value);
    }

    if((mask & VERTEX_ARRAY_BIT) == VERTEX_ARRAY_BIT){
        if(this._vertexArrayStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','VERTEX_ARRAY_BIT'));
        }
        value = this._vertexArrayStack.pop();
        this.bindVertexArray(value);
    }

    if((mask & TEXTURE_BIT) == TEXTURE_BIT){
        if(this._textureStack.length == 0){
            throw new Error(STR_ERROR_STACK_POP_BIT.replace('%s','TEXTURE_BIT'));
        }
        stack = this._textureStack.pop();
        for(var i = 0, l = stack.length; i < l; ++i){
            this.bindTexture(stack[i],i);
        }
    }

    if((mask & FRAMEBUFFER_BIT) == FRAMEBUFFER_BIT){
        value = this._framebufferStack.pop();
        this.bindFramebuffer(value);
    }

    if((mask & MESH_BIT) == MESH_BIT){
        value = this._meshStack.pop();
        this.bindMesh(value);
    }
};

/**
 *
 * @param {Number} [mask]
 * @returns {Array}
 */

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

    if((mask & STENCIL_BIT) == STENCIL_BIT){
        state.push([this._stencilTest,Vec3.copy(this._stencilFunc),Vec4.copy(this._stencilFuncSeparate),Vec3.copy(this._stencilOp),Vec4.copy(this._stencilOpSeparate)]);
    }

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        state.push(Vec4.copy(this._viewport));
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        state.push([this._scissorTest, this._scissorStack]);
    }

    if((mask & CULL_BIT) == CULL_BIT){
        state.push([this._cullFace, this._cullFaceMode]);
    }

    if((mask & BLEND_BIT) == BLEND_BIT){
        state.push([this._blend,Vec4.copy(this._blendColor),this._blendEquation,Vec2.copy(this._blendEquationSeparate),Vec2.copy(this._blendFunc)]);
    }

    if((mask & LINE_WIDTH_BIT) == LINE_WIDTH_BIT){
        state.push(this._lineWidth);
    }

    if((mask & MATRIX_PROJECTION_BIT) == MATRIX_PROJECTION_BIT){
        state.push(Mat4.copy(this._matrix[MATRIX_PROJECTION_BIT]));
    }

    if((mask & MATRIX_VIEW_BIT) == MATRIX_VIEW_BIT){
        state.push(Mat4.copy(this._matrix[MATRIX_VIEW_BIT]));
    }

    if((mask & MATRIX_MODEL_BIT) == MATRIX_MODEL_BIT){
        state.push(Mat4.copy(this._matrix[MATRIX_MODEL_BIT]));
    }

    if((mask & PROGRAM_BIT) == PROGRAM_BIT){
        state.push(this._program);
    }

    if((mask & TEXTURE_BIT) == TEXTURE_BIT){
        state.push(this._textures.slice(0));
    }

    if((mask & FRAMEBUFFER_BIT) == FRAMEBUFFER_BIT){
        state.push(this._framebuffer);
    }

    if((mask & MESH_BIT) == MESH_BIT){
        state.push(this._mesh);
    }

    return state.length > 1 ? state : state[0];
};

/**
 * Sets the viewport.
 * @param {Number} x - origin x (lower left corner)
 * @param {Number} y - origin y (lower left corner)
 * @param {Number} width - rectangle width
 * @param {Number} height - rectangle height
 */

Context.prototype.setViewport = function(x,y,width,height){
    if(Vec4.equals4(this._viewport,x,y,width,height)){
        return;
    }
    Vec4.set4(this._viewport,x,y,width,height);
    this._gl.viewport(x,y,width,height);
};

/**
 * Returns the current viewport rectangle.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getViewport = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out,this._viewport);
};

/**
 * Enables / disables culling polygons based on their winding in window coordinates.
 * @param {Boolean} culling
 */

Context.prototype.setCullFace = function(culling){
    if(culling == this._cullFace){
        return;
    }
    if(culling){
        this._gl.enable(this._gl.CULL_FACE);
    }
    else {
        this._gl.disable(this._gl.CULL_FACE);
    }
    this._cullFace = culling;
};

/**
 * Returns true if culling is enabled.
 * @returns {Boolean}
 */

Context.prototype.getCullFace = function(){
    return this._cullFace;
};

/**
 * Specify whether front- or back-facing polygons can be culled.
 * @param {Number} mode
 */

Context.prototype.setCullFaceMode = function(mode){
    if(mode == this._cullFaceMode){
        return;
    }
    this._gl.cullFace(mode);
    this._cullFaceMode = mode;
};

/**
 * Returns the current cull face mode.
 * @returns {Number}
 */

Context.prototype.getCullFaceMode = function(){
    return this._cullFaceMode;
};

/**
 * Enables / disables discarding fragments that are outside the scissor rectangle.
 * @param {Boolean} scissor
 */

Context.prototype.setScissorTest = function(scissor){
    if(scissor == this._scissorTest){
        return;
    }
    scissor ? this._gl.enable(this._gl.SCISSOR_TEST) : this._gl.disable(this._gl.SCISSOR_TEST);
    this._scissorTest = scissor;
};

/**
 * Returns true if scissor test is enabled.
 * @returns {Boolean}
 */

Context.prototype.getScissorTest = function(){
    return this._scissorTest
};

/**
 * Defines the scissor box.
 * @param {Number} x - origin x (lower left corner)
 * @param {Number} y - origin y (lower left corner)
 * @param {Number} w - width of the rectangle
 * @param {Number} h - height of the rectangle
 */

Context.prototype.setScissor = function(x,y,w,h){
    if(Vec4.equals4(this._scissorBox,x,y,w,h)){
        return;
    }
    this._gl.scissor(x,y,w,h);
    Vec4.set4(this._scissorBox,x,y,w,h);
};

/**
 * Returns the current scissor box.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getScissor = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out, this._scissorBox);
};

/**
 * Enables / disables stencil testing and updating the stencil buffer.
 * @param {Boolean} stencilTest
 */

Context.prototype.setStencilTest = function(stencilTest){
    if(stencilTest == this._stencilTest){
        return;
    }
    if(stencilTest){
        this._gl.enable(this._gl.STENCIL_TEST);
    }
    else{
        this._gl.disable(this._gl.STENCIL_TEST);
    }
    this._stencilTest = stencilTest;
};

/**
 * Returns true if stencil testing is enabled.
 * @returns {Boolean}
 */

Context.prototype.getStencilTest = function(){
    return this._stencilTest;
};

/**
 * Sets the front and back function and reference value for stencil testing.
 * @param {Number} func - The test function
 * @param {Number} ref - The reference value for the stencil test
 * @param {Number} mask - A mask that is ANDed with both the reference value and the stored stencil value whe the test is done
 */

Context.prototype.setStencilFunc = function(func,ref,mask){
    if(Vec3.equals3(this._stencilFunc,func,ref,mask)){
        return;
    }
    this._gl.stencilFunc(func,ref,mask);
    Vec3.set3(this._stencilFunc,func,ref,mask);
};

/**
 * Returns the current stencil func set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getStencilFunc = function(out){
    out = out === undefined ? Vec3.create() : out;
    return Vec3.set(out, this._stencilFunc);
};

/**
 * Sets the front and back function and reference value for stencil testing.
 * @param {Number} face - Either front and/or back stencil to be updated
 * @param {Number} func - The test function
 * @param {Number} ref - The reference value for the stencil test
 * @param {Number} mask - A mask that is ANDed with both the reference value and the stored stencil value whe the test is done
 */

Context.prototype.setStencilFuncSeparate = function(face, func, ref, mask){
    if(Vec4.equals4(this._stencilFuncSeparate,face,func,ref,mask)){
        return;
    }
    this._gl.stencilFuncSeparate(face,func,ref,mask);
    Vec4.set4(this._stencilFuncSeparate,face,func,ref,mask);
};

/**
 * Returns the current stencil func separate set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getStencilFuncSeparate = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out, this._stencilFuncSeparate);
};

/**
 * Sets the front and back stencil test actions.
 * @param {Number} fail - The action to take when stencil test fails
 * @param {Number} zfail - The stencil action when the stencil passes, but the depth test fails
 * @param {Number} zpass - The stencil action when both the stencil and the depth test pass, or when the stencil passes and either there is no depth buffer or depth testing is not enabled
 */

Context.prototype.setStencilOp = function(fail, zfail, zpass){
    if(Vec3.equals3(this._stencilOp,fail,zfail,zpass)){
        return;
    }
    this._gl.stencilOp(fail,zfail,zpass);
    Vec3.set3(this._stencilOp,fail,zfail,zpass);
};

/**
 * Returns the current front and back stencil test actions set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getStencilOp = function(out){
    out = out === undefined ? Vec3.create() : out;
    return Vec3.set(out, this._stencilOp);
};

/**
 * Sets the front and/or back stencil test actions.
 * @param {Number} face - Either the front and/or back stencil to be updated
 * @param {Number} fail - The action to take when stencil test fails
 * @param {Number} zfail - The stencil action when the stencil passes, but the depth test fails
 * @param {Number} zpass - The stencil action when both the stencil and the depth test pass, or when the stencil passes and either there is no depth buffer or depth testing is not enabled
 */

Context.prototype.setStencilOpSeparate = function(face, fail, zfail, zpass){
    if(Vec4.equals4(this._stencilFuncSeparate,face,fail,zfail,zpass)){
        return;
    }
    this._gl.stencilOpSeparate(face,fail,zfail,zpass);
    Vec4.set4(this._stencilFuncSeparate,face,fail,zfail,zpass);
};

/**
 * Returns the current stencil test separate set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getStencilOpSeparate = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out, this._stencilOpSeparate);
};

/**
 * Sets the clear value for the stencil buffer.
 * @param {Number} s - The index to be used when the stencil buffer is cleared.
 */

Context.prototype.clearStencil = function(s){
    this._gl.clearStencil(s);
};

/**
 * Sets the clear values for the color buffers.
 * @param {Number} r - Red value
 * @param {Number} g - Green value
 * @param {Number} b - Blue value
 * @param {Number} a - Alpha value
 */

Context.prototype.setClearColor = function(r,g,b,a){
    if(Vec4.equals4(this._clearColor,r,g,b,a)){
        return;
    }
    this._gl.clearColor(r,g,b,a);
    Vec4.set4(this._clearColor,r,g,b,a);
};

/**
 * Returns the current clear color set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getClearColor = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out,this._clearColor);
};

/**
 * Enables / disables writing of frame buffer color components.
 * @param {Boolean} r
 * @param {Boolean} g
 * @param {Boolean} b
 * @param {Boolean} a
 */

Context.prototype.setColorMask = function(r,g,b,a){
    if(Vec4.equals4(this._colorMask,r,g,b,a)){
        return;
    }
    this._gl.colorMask(r,g,b,a);
    Vec4.set4(this._colorMask,r,g,b,a);
};

/**
 * Returns the current color mask set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getColorMask = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out,this._colorMask);
};

/**
 * Enables / disables depth comparisons and updating the depth buffer.
 * @param {Boolean} depthTest
 */

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

/**
 * Returns true if depth testing is enabled.
 * @returns {Boolean}
 */

Context.prototype.getDepthTest = function(){
    return this._depthTest;
};

/**
 * Enables / disables writing into the depth buffer.
 * @param {Boolean} flag
 */

Context.prototype.setDepthMask = function(flag){
    if(flag == this._depthMask){
        return;
    }
    this._gl.depthMask(flag);
    this._depthMask = flag;
};

/**
 * Returns true if writing into depth buffer is enabled.
 * @returns {Boolean}
 */

Context.prototype.getDepthMask = function(){
    return this._depthMask;
};

/**
 * Sets the value used for depth comparisons.
 * @param {Number} func
 */

Context.prototype.setDepthFunc = function(func){
    if(func == this._depthFunc){
        return;
    }
    this._gl.depthFunc(func);
    this._depthFunc = func;
};

/**
 * Returns the current depth func set.
 * @returns {Number}
 */

Context.prototype.getDepthFunc = function(){
    return this._depthFunc;
};

/**
 * Sets the clear value for the depth buffer.
 * @param {Number} depth
 */

Context.prototype.setClearDepth = function(depth){
    if(depth == this._depthClearValue){
        return;
    }
    this._gl.clearDepth(depth);
    this._depthClearValue = depth;
};

/**
 * Returns the current depth buffer clear value set.
 * @returns {Number}
 */

Context.prototype.getClearDepth = function(){
    return this._depthClearValue;
};

/**
 * Sets the mapping of depth values from normalized device coordinates to window coordinates.
 * @param {Number} znear - The mapping of the near clipping plane to window coordinates
 * @param {Number} zfar - The mapping of the far clipping plane to window coordinates
 */

Context.prototype.setDepthRange = function(znear,zfar){
    if(Vec2.equals2(this._depthRange,znear,zfar)){
        return;
    }
    this._gl.depthRange(znear,zfar);
    this._depthRange[0] = znear;
    this._depthRange[1] = zfar;
};

/**
 * Returns the current depth range values set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getDepthRange = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out,this._depthRange);
};

/**
 * Sets the scale and units used to calculate depth values
 * @param {Number} factor
 * @param {Number} units
 */

Context.prototype.setPolygonOffset = function(factor,units){
    if(Vec2.equals(this._polygonOffset,factor,units)){
        return;
    }
    this._gl.polygonOffset(factor,units);
    this._polygonOffset[0] = factor;
    this._polygonOffset[1] = units;
};

/**
 * Returns the current polygon offset values.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getPolygonOffset = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out,this._polygonOffset);
};

/**
 * Sets the width of rasterized lines.
 * @param {Number} lineWidth
 */

Context.prototype.setLineWidth = function(lineWidth){
    if(this._lineWidth == lineWidth){
        return;
    }
    this._gl.lineWidth(lineWidth);
    this._lineWidth = lineWidth;
};

/**
 * Returns the current line width value.
 * @returns {Number}
 */

Context.prototype.getLineWidth = function(){
    return this._lineWidth;
};

/**
 * Enables / disables blending the computed fragment color values with the values in the color buffers.
 * @param {Boolean} blend
 */

Context.prototype.setBlend = function(blend){
    if(blend == this._blend){
        return;
    }
    if(blend){
        this._gl.enable(this._gl.BLEND);
    }
    else {
        this._gl.disable(this._gl.BLEND);
    }
    this._blend = blend;
};

/**
 * Returns true if blending is enabled.
 * @returns {Boolean}
 */

Context.prototype.getBlend = function(){
    return this._blend;
};

/**
 * Sets the blend color.
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 */

Context.prototype.setBlendColor = function(r,g,b,a){
    if(Vec4.equals4(this._blendColor,r,g,b,a)){
        return;
    }
    this._gl.blendColor(r,g,b,a);
    Vec4.set4(this._blendColor,r,g,b,a);
};

/**
 * Return the current blend color set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getBlendColor = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out, this._blendColor);
};

/**
 * Sets the equation used for both the RGB blend equation and the alpha blend equation.
 * @param {Number} mode
 */

Context.prototype.setBlendEquation = function(mode){
    if(mode == this._blendEquation){
        return;
    }
    this._gl.blendEquation(mode);
    this._blendEquation = mode;
};

/**
 * Returns the current blend equation set.
 * @returns {Number}
 */

Context.prototype.getBlendEquation = function(){
    return this._blendEquation;
};

/**
 * Sets the RGB blend equation and the alpha blend equation separately.
 * @param {Number} modeRGB
 * @param {Number} modeAlpha
 */

Context.prototype.setBlendEquationSeparate = function(modeRGB, modeAlpha){
    if(Vec2.equals2(this._blendEquationSeparate,modeRGB,modeAlpha)){
        return;
    }
    this._gl.blendEquationSeparate(modeRGB,modeAlpha);
    Vec2.set2(this._blendEquationSeparate,modeRGB,modeAlpha);
};

/**
 * Returns the current RGB and alpha blend equation set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getBlendEquationSeparate = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out, this._blendEquationSeparate);
};

/**
 * Sets the pixel arithmetic.
 * @param {Number} sfactor - Specifies how the red, green, blue, and alpha source blending factors are computed
 * @param {Number} dfactor - Specifies how the red, green, blue, and alpha destination blending factors are computed
 */

Context.prototype.setBlendFunc = function(sfactor,dfactor){
    if(Vec2.equals2(this._blendFunc,sfactor,dfactor)){
        return;
    }
    this._gl.blendFunc(sfactor,dfactor);
    Vec2.set2(this._blendFunc,sfactor,dfactor);
};

/**
 * Returns the current pixel arithmetic set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getBlendFunc = function(out){
    out = out === undefined ? Vec2.create() : out;
    return Vec2.set(out, this._blendFunc);
};

/**
 * Sets the pixel arithmetic for RGB and alpha components separately.
 * @param {Number} srcRGB - Specifies how the red, green, and blue blending factors are computed
 * @param {Number} dstRGB - Specifies how the red, green, and blue destination blending factors are computed
 * @param {Number} srcAlpha - Specifies how the alpha source blending factor is computed
 * @param {Number} dstAlpha Specifies how the alpha destination blending factor is computed
 */

Context.prototype.setBlendFuncSeparate = function(srcRGB,dstRGB,srcAlpha,dstAlpha){
    if(Vec4.equals4(this._blendFuncSeparate,srcRGB,dstRGB,srcAlpha,dstAlpha)){
        return;
    }
    this._gl.blendFuncSeparate(srcRGB,dstRGB,srcAlpha,dstAlpha);
    Vec4.set4(this._blendFuncSeparate,srcRGB,dstRGB,srcAlpha,dstAlpha);
};

/**
 * Returns the current pixel arithmetic for RGB and alpha components separately set.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getBlendFuncSeparate = function(out){
    out = out === undefined ? Vec4.create() : out;
    return Vec4.set(out,this._blendFuncSeparate);
};

/**
 * Clears buffers to preset values.
 * @param {Number} mask - Bitwise OR of masks that indicate the buffers to be cleared
 */

Context.prototype.clear = function(mask){
    this._gl.clear(this._bitMap[mask]);
};

/**
 * Sets the projection matrix to be used.
 * @param {Array} matrix
 */

Context.prototype.setProjectionMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_PROJECTION],matrix);
    this._matrixSend[MATRIX_PROJECTION] = false;
};

/**
 * Sets the view matrix to be used.
 * @param {Array} matrix
 */

Context.prototype.setViewMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_VIEW],matrix);
    this._matrixSend[MATRIX_VIEW] = false;

    if(this._matrixTypesByUniformInProgram[MATRIX_INVERSE_VIEW] !== undefined){
        Mat4.invert(Mat4.set(this._matrix[MATRIX_INVERSE_VIEW],matrix));
        this._matrixSend[MATRIX_INVERSE_VIEW] = false;
    }
};

/**
 * Set the model matrix to be used.
 * @param {Array} matrix
 */

Context.prototype.setModelMatrix = function(matrix){
    Mat4.set(this._matrix[MATRIX_MODEL],matrix);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Returns the current projection matrix.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getProjectionMatrix = function(out){
    out = out === undefined ? Mat4.create() : out;
    return Mat4.set(out, this._matrix[MATRIX_PROJECTION]);
};

/**
 * Returns the current view matrix.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getViewMatrix = function(out){
    out = out === undefined ? Mat4.create() : out;
    return Mat4.set(out, this._matrix[MATRIX_VIEW]);
};

/**
 * Returns the current model matrix.
 * @param {Array} [out]
 * @returns {Array}
 */

Context.prototype.getModelMatrix = function(out){
    out = out === undefined ? Mat4.create() : out;
    return Mat4.set(out, this._matrix[MATRIX_MODEL]);
};

/**
 * Pushes the current projection matrix on the projection matrix stack.
 */

Context.prototype.pushProjectionMatrix = function(){
    this._matrixStack[MATRIX_PROJECTION_BIT].push(Mat4.copy(this._matrix[MATRIX_PROJECTION]));
};

/**
 * Replaces the current projection matrix with the matrix previously pushed on the stack and removes the top.
 */

Context.prototype.popProjectionMatrix = function(){
    this._matrix[MATRIX_PROJECTION] = this._matrixStack[MATRIX_PROJECTION_BIT].pop();
    this._matrixSend[MATRIX_PROJECTION] = false;
};

/**
 * Pushes the current view matrix on the view matrix stack.
 */


Context.prototype.pushViewMatrix = function(){
    this._matrixStack[MATRIX_VIEW_BIT].push(Mat4.copy(this._matrix[MATRIX_VIEW]));
};

/**
 * Replaces the current view matrix with the matrix previously pushed on the stack and removes the top.
 */

Context.prototype.popViewMatrix = function(){
    this._matrix[MATRIX_VIEW] = this._matrixStack[MATRIX_VIEW_BIT].pop();
    this._matrixSend[MATRIX_VIEW] = false;
};

/**
 * Pushes the current model matrix on the model matrix stack.
 */

Context.prototype.pushModelMatrix = function(){
    this._matrixStack[MATRIX_MODEL_BIT].push(Mat4.copy(this._matrix[MATRIX_MODEL]));
};

/**
 * Replaces the current model matrix with the matrix previously pushed on the stack and removes the top.
 */

Context.prototype.popModelMatrix = function(){
    this._matrix[MATRIX_MODEL] = this._matrixStack[MATRIX_MODEL_BIT].pop();
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Pushes all matrices on their stack.
 */
Context.prototype.pushMatrices = function(){
    this.pushProjectionMatrix();
    this.pushViewMatrix();
    this.pushModelMatrix();
}

/**
 * Replaces all matrices with the matrices previously pushed on the stack and removes the top.
 */
Context.prototype.popMatrices = function(){
    this.popModelMatrix();
    this.popViewMatrix();
    this.popProjectionMatrix();
}

/**
 * Resets the current model matrix to its identity.
 */

Context.prototype.loadIdentity = function(){
    Mat4.identity(this._matrix[MATRIX_MODEL]);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Resets all matrices to their identities.
 */
Context.prototype.loadIdentities = function(){
    Mat4.identity(this._matrix[MATRIX_PROJECTION]);
    this._matrixSend[MATRIX_PROJECTION] = false;
    Mat4.identity(this._matrix[MATRIX_VIEW]);
    this._matrixSend[MATRIX_VIEW] = false;
    this.loadIdentity();
}

/**
 * Scales the current model matrix.
 * @param {Array} v
 */

Context.prototype.scale = function(v){
    Mat4.scale(this._matrix[MATRIX_MODEL],v);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Translates the current model matrix.
 * @param {Array} v
 */

Context.prototype.translate = function(v){
    Mat4.translate(this._matrix[MATRIX_MODEL],v);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Rotates the current model matrix with angle and axis.
 * @param {Number} r
 * @param {Array} v
 */

Context.prototype.rotate = function(r,v){
    Mat4.rotate(this._matrix[MATRIX_MODEL],r,v);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Rotates the current model matrix with rotation per axis.
 * @param {Array} v
 */

Context.prototype.rotateXYZ = function(v){
    Mat4.rotateXYZ(this._matrix[MATRIX_MODEL],v);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Rotates the current model matrix with a quaternion.
 * @param {Array} q
 */

Context.prototype.rotateQuat = function(q){
    Mat4.mult(this._matrix[MATRIX_MODEL],Mat4.fromQuat(this._matrix4Temp,q));
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Multiplies the current model matrix with another matrix.
 * @param {Array} m
 */

Context.prototype.multMatrix = function(m){
    Mat4.mult(this._matrix[MATRIX_MODEL],m);
    this._matrixSend[MATRIX_MODEL] = false;
};

/**
 * Creates a program object.
 * @param {String} vertSrc
 * @param {String} [fragSrc] - vert shader source (or combined vert/fragShader)
 * @param {Array} [attributeLocationMap] - attribute locations map { 0: 'aPositon', 1: 'aNormal', 2: 'aColor' }
 * @returns {Program}
 */

Context.prototype.createProgram = function(vertSrc, fragSrc, attributeLocationMap){
    return new Program(this, vertSrc, fragSrc, attributeLocationMap);
};

/**
 * Binds a program object as part of the current rendering state.
 * @param {Program} program
 */

Context.prototype.bindProgram = function(program) {
    if(program === this._program){
        return;
    }
    var prevHadInverseViewMatrix = this._matrixTypesByUniformInProgram[ProgramUniform.INVERSE_VIEW_MATRIX] !== undefined;

    program._bindInternal();

    this._program = program;
    this._matrixSend[MATRIX_PROJECTION]   = false;
    this._matrixSend[MATRIX_VIEW]         = false;
    this._matrixSend[MATRIX_MODEL]        = false;
    this._matrixSend[MATRIX_NORMAL]       = false;
    this._matrixSend[MATRIX_INVERSE_VIEW] = false;

    this._matrixTypesByUniformInProgram = {};
    for(var entry in ProgramUniform){
        var uniformName = ProgramUniform[entry];
        if(program.hasUniform(uniformName)){
            this._matrixTypesByUniformInProgram[uniformName] = this._matrixTypeByUniformNameMap[uniformName];
        }
    }

    if(!prevHadInverseViewMatrix && this._matrixTypesByUniformInProgram[ProgramUniform.INVERSE_VIEW_MATRIX] !== undefined){
        Mat4.invert(Mat4.set(this._matrix[MATRIX_INVERSE_VIEW],this._matrix[MATRIX_VIEW]));
    }
};

/**
 * Returns the current program used.
 * @returns {null|Program}
 */

Context.prototype.getProgram = function(){
    return this._program;
};

/**
 * Creates a buffer object.
 * @param {Number} target
 * @param {(Number|Float32Array|Uint8Array|Uint16Array|Uint32Array)} sizeOrData
 * @param {Number} [usage]
 * @param {Boolean} [preserveData]
 * @returns {Buffer}
 */

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

/**
 * Creates a vertex array object.
 * @param {Array} attributes
 * @param {Buffer} [indexBuffer]
 * @returns {VertexArray}
 */

Context.prototype.createVertexArray = function(attributes, indexBuffer) {
    return new VertexArray(this, attributes, indexBuffer);
};

/**
 * Binds a vertex array object.
 * @param {VertexArray} vertexArray
 */

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

/**
 * Returns the current vertex array object used.
 * @returns {null|VertexArray}
 */

Context.prototype.getVertexArray = function(){
    return this._vertexArray;
};

/**
 * Creates a mesh object.
 * @param attributes
 * @param indicesInfo
 * @param primitiveType
 * @returns {Mesh}
 */

Context.prototype.createMesh = function(attributes, indicesInfo, primitiveType){
    return new Mesh(this,attributes,indicesInfo,primitiveType);
};

/**
 * Binds a mesh object.
 * @param {Mesh} mesh
 */

Context.prototype.bindMesh = function(mesh){
    if(mesh === null){
        this._meshPrimitiveType = null;
        this._meshHasIndexBuffer = false;
        this._meshIndexBufferDataType = null;
        this._meshCount = 0;
        this._meshHasDivisor = null;
    } else {
        this._meshPrimitiveType = mesh._primiviteType;
        this._meshHasIndexBuffer = mesh._indices !== null;
        this._meshIndexBufferDataType = this._meshHasIndexBuffer ? mesh._indices.buffer.getDataType() : null;
        this._meshCount = mesh._count;
        //TODO: Add Mesh hasDivisor bool
        this._meshHasDivisor = null;
        this.bindVertexArray(mesh._vao);
    }
    this._mesh = mesh;
};

/**
 * Draws the mesh currently bound.
 * @param {Number} [primcount]
 */

//TODO: fix this, how does passing instances count work, are count and offset supported?
Context.prototype.drawMesh = function(primcount){
    this._updateMatrixUniforms();

    if(this._meshHasIndexBuffer){
        if(this._meshHasDivisor){
            this._gl.drawElementsInstanced(this._meshPrimitiveType, this._meshCount, this._meshIndexBufferDataType, 0, primcount);
        }
        else{
            this._gl.drawElements(this._meshPrimitiveType, this._meshCount, this._meshIndexBufferDataType, 0);
        }
    }
    else{
        if(this._meshHasDivisor){
            this._gl.drawArraysInstanced(this._meshPrimitiveType, 0, this._meshCount, primcount);
        }
        else {
            this._gl.drawArrays(this._meshPrimitiveType, 0, this._meshCount);
        }
    }
};

/**
 * Returns the mesh currently used.
 * @returns {null|Mesh}
 */

Context.prototype.getMesh = function(){
    return this._mesh;
};

/**
 *
 * @param data
 * @param width
 * @param height
 * @param options
 * @returns {Texture2D}
 */

Context.prototype.createTexture2D = function(data, width, height, options) {
    return new Texture2D(this, data, width, height, options);
};

/**
 *
 * @param facesData
 * @param width
 * @param height
 * @param options
 * @returns {TextureCube}
 */

Context.prototype.createTextureCube = function(facesData, width, height, options) {
    return new TextureCube(this, facesData, width, height, options);
};

/**
 *
 * @param texture
 * @param textureUnit
 */

Context.prototype.bindTexture = function(texture, textureUnit) {
    textureUnit = textureUnit || 0;
    if(this._textures[textureUnit] == texture){
        return;
    }
    this._gl.activeTexture(this._gl.TEXTURE0 + textureUnit);
    texture._bindInternal();
    this._textures[textureUnit] = texture;
};

/**
 * Returns the current texture bound.
 * @param {Number} [textureUnit]
 * @returns {null|Texture2D|TextureCube}
 */

Context.prototype.getTexture = function(textureUnit){
    textureUnit = textureUnit || 0;
    return this._textures[textureUnit];
};

/**
 * Creates a frambuffer object.
 * @param colorAttachments
 * @param depthAttachment
 * @returns {Framebuffer}
 */

Context.prototype.createFramebuffer = function(colorAttachments, depthAttachment) {
    return new Framebuffer(this, colorAttachments, depthAttachment);
};

/**
 * Binds a framebuffer object.
 * @param {Framebuffer} framebuffer
 */

Context.prototype.bindFramebuffer = function(framebuffer) {
    framebuffer = framebuffer === undefined ? null : framebuffer;
    if(framebuffer == this._framebuffer){
        return;
    }
    if (framebuffer) {
        framebuffer._bindInternal();
    }
    else {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }
    this._framebuffer = framebuffer;
};

/**
 * Returns the current frambuffer object bound.
 * @returns {null|Framebuffer}
 */

Context.prototype.getFramebuffer = function(){
    return this._framebuffer;
};

Context.prototype._updateMatrixUniforms = function(){
    if(this._matrixTypesByUniformInProgram[ProgramUniform.NORMAL_MATRIX] !== undefined &&
       (!this._matrixSend[MATRIX_VIEW] || !this._matrixSend[MATRIX_MODEL])){

        var temp = Mat4.set(this._matrix4Temp,this._matrix[MATRIX_VIEW]);
        Mat4.mult(temp, this._matrix[MATRIX_MODEL]);

        Mat4.invert(temp);
        Mat4.transpose(temp);
        Mat3.fromMat4(this._matrix[MATRIX_NORMAL],temp)
        this._matrixSend[MATRIX_NORMAL] = false;
    }

    for(var uniformName in this._matrixTypesByUniformInProgram){
        var matrixType = this._matrixTypesByUniformInProgram[uniformName];
        if(!this._matrixSend[matrixType]){
            var tempMatrixF32 = this._matrixTempByTypeMap[matrixType];
                tempMatrixF32.set(this._matrix[matrixType]);
            this._program.setUniform(uniformName,tempMatrixF32);
            this._matrixSend[matrixType] = true;
        }
    }
};

/**
 * Renders primitives from array data.
 * @param {Number} mode
 * @param {Number} first
 * @param {Number} count
 */

Context.prototype.drawArrays = function(mode, first, count){
    this._updateMatrixUniforms();
    this._gl.drawArrays(mode, first, count);
};

/**
 * Draws multiple instances of a range of elements.
 * @param {Number} mode
 * @param {Number} first
 * @param {Number} count
 * @param {Number} primcount
 */

Context.prototype.drawArraysInstanced = function(mode, first, count, primcount){
    this._updateMatrixUniforms();
    this._gl.drawArraysInstanced(mode, first, count, primcount);
};

/**
 * Renders primitives from array data
 * @param {Number} mode
 * @param {Number} count
 * @param {Number} offset
 */

Context.prototype.drawElements = function(mode, count, offset){
    this._updateMatrixUniforms();
    this._gl.drawElements(mode, count, this._vertexArrayIndexBufferDataType, offset);
};

/**
 * Draw multiple instances of a set of elements
 * @param {Number} mode
 * @param {Number} count
 * @param {Number} offset
 * @param {Number} primcount
 */

Context.prototype.drawElementsInstanced = function(mode, count, offset, primcount){
    this._updateMatrixUniforms();
    this._gl.drawElementsInstanced(mode, count, this._vertexArrayIndexBufferDataType, offset, primcount);
};

//NOTE: We keep this for a moment to prevent breaking everything atm.
Context.prototype.draw = function(mode, first, count){
    this._updateMatrixUniforms();

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

Context.prototype.readPixels = function(x,y,width,height,format,type,pixels){
    this._gl.readPixels(x,y,width,height,format,type,pixels);
}

Context.prototype.isSupported = function(flag) {
    return this._caps[flag];
};

module.exports = Context;
