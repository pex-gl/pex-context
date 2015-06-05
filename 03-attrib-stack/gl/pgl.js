var glu      = require('./glu');
var Matrix44 = require('../math/Matrix44');

var gl = {};
var pgl = {};

pgl._gl = null;

/*---------------------------------------------------------------------------------------------------------*/
// Attribs
/*---------------------------------------------------------------------------------------------------------*/

//Depth range (near and far)
//Viewport origin and extent
var VIEWPORT_BIT       = pgl.VIEWPORT_BIT       = 1 << 0;
//clearColor
//GL_ALPHA_TEST enable bit
//Alpha test function and reference value
//GL_BLEND enable bit
//Blending source and destination functions
//Constant blend color
//Blending equation
var COLOR_BUFFER_BIT   = pgl.COLOR_BUFFER_BIT   = 1 << 1;
var DEPTH_BUFFER_BIT   = pgl.DEPTH_BUFFER_BIT   = 1 << 2;
var ENABLE_BIT         = pgl.ENABLE_BIT         = 1 << 3;
var HINT_BIT           = pgl.HINT_BIT           = 1 << 4;
//GL_SCISSOR_TEST flag
//Scissor box
var SCISSOR_BIT        = pgl.SCISSOR_BIT        = 1 << 5;
var STENCIL_BUFFER_BIT = pgl.STENCIL_BUFFER_BIT = 1 << 6;
var TEXTURE_BIT        = pgl.TEXTURE_BIT        = 1 << 7;



var MODEL_STACK = null;
var PERSPECTIVE_STACK = null;

var attribMaskLast = {};

var attribStackViewport = {};
var attribViewport = {};

var attribStackColorBuffer = {};
var attribColorBuffer = {};

var attribStackScissor = {};
var attribScissor = {};

var attribsStack = [
    attribStackViewport,
    attribStackColorBuffer,
    attribStackScissor
];


/*---------------------------------------------------------------------------------------------------------*/
// Matrices
/*---------------------------------------------------------------------------------------------------------*/

var MODELVIEW = 1 << 100;
var PROJECTION = 1 << 101;

var MATRIX44_TEMP     = new Matrix44();
var MATRIX44_F32_TEMP = new Float32Array(16);

var matrixStackModel      = {};
var matrixStackModelView  = {};
var matrixStackProjection = {};

var matrixMode = {};
var matrixNormalDirty = {};

var matrixView       = {};
var matrixModel      = {};
var matrixModelView  = {};
var matrixProjection = {};
var matrixNormal     = {};

var matricesStacks = [
    matrixStackModel,
    matrixStackModelView,
    matrixStackProjection
];

/*---------------------------------------------------------------------------------------------------------*/
// init & reset
/*---------------------------------------------------------------------------------------------------------*/

pgl.init = function(window){
    var gl = window._gl;

    for(var i = 0, l = attribsStack.length; i < l; ++i){
        attribsStack[i][gl] = [];
    }

    for(var i = 0, l = matricesStacks.length; i < l; ++i){
        matricesStacks[i][gl] = [];
    }

    matrixView[gl]       = new Matrix44();
    matrixModel[gl]      = new Matrix44();
    matrixModelView[gl]  = new Matrix44();
    matrixProjection[gl] = new Matrix44();
    matrixNormal[gl]     = new Matrix44();

    this.reset(window);
};

pgl.reset = function(window){
    var gl = this._gl = window._gl;
    var windowWidth  = window.getWidth();
    var windowHeight = window.getHeight();

    attribMaskLast[gl] = -1;

    //VIEWPORT_BIT – defaults
    attribStackViewport[gl] = [[
            [0,0,windowWidth,windowHeight], //viewport x,y,width,height
            [0,1] //zNear, zFar
        ]
    ];
    attribViewport[gl] = attribStackViewport[gl][0];

    //COLOR_BUFFER_BIT – defaults
    attribStackColorBuffer[gl] = [[
            [0,0,0,1], //clear color
        ]
    ];
    attribColorBuffer[gl] = attribStackColorBuffer[gl][0];

    //SCISSOR_BIT
    attribStackScissor[gl] = [[
            false,
            [0,0,windowWidth,windowHeight]
        ]
    ];
    attribScissor[gl] = attribStackScissor[gl][0];

    //MATRIX
    matrixMode[gl] = MODELVIEW;
    matrixNormalDirty[gl] = true;

    if(matrixStackModel[gl].length != 0){
        throw new Error('Invalid model matrix stack.');
    }

    if(matrixStackModelView[gl].length != 0){
        throw new Error('Invalid model view matrix stack.');

    }

    if(matrixStackProjection[gl].length != 0){
        throw new Error('Invalid projection matrix stack.');

    }

    matrixView[gl].identity();
    matrixModel[gl].identity();
    matrixModelView[gl].identity();
    matrixProjection[gl].identity();
    matrixNormal[gl].identity();
};


/*---------------------------------------------------------------------------------------------------------*/
// Attribs methods
/*---------------------------------------------------------------------------------------------------------*/

pgl.pushAttrib = function(mask){
    var gl = this._gl;
    var stack;

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        stack = attribStackViewport[gl];
        stack.push(attribViewport[gl].slice());
        attribViewport[gl] = stack[stack.length - 1];
    }

    if((mask & COLOR_BUFFER_BIT) == COLOR_BUFFER_BIT){
        stack = attribStackColorBuffer[gl];
        stack.push(attribColorBuffer[gl].slice());
        attribColorBuffer[gl] = stack[stack.length - 1];
    }

    if((mask & DEPTH_BUFFER_BIT) == DEPTH_BUFFER_BIT){

    }

    if((mask & ENABLE_BIT) == ENABLE_BIT){

    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        stack = attribStackScissor[gl];
        stack.push(attribScissor[gl]);
        attribScissor[gl] = stack[stack.length - 1];
    }

    attribMaskLast[gl] = mask;
};

pgl.popAttrib = function(){
    var gl   = this._gl;
    var mask = attribMaskLast[gl];
    var stack, stackPrev, attrib, attribPrev;

    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        stack     = attribStackViewport[gl];
        stackPrev = stack.pop();
        stack     = stack[stack.length - 1];

        //viewport
        attribPrev = stackPrev[0];
        attrib     = stack[0];

        var x = attrib[0];
        var y = attrib[1];
        var width  = attrib[2];
        var height = attrib[3];

        if(x != attribPrev[0] ||
           y != attribPrev[1] ||
           width  != attribPrev[2] ||
           height != attribPrev[3]){
            gl.viewport(x,y,width,height);
        }

        //depthRange
        attribPrev = stackPrev[1];
        attrib     = stack[1];

        var zNear = attrib[0];
        var zFar  = attrib[1];

        if(zNear != attribPrev[0] || zFar != attribPrev[1]){
            gl.depthRange(attrib[0],attrib[1]);
        }
    }

    if((mask & COLOR_BUFFER_BIT) == COLOR_BUFFER_BIT){
        stack     = attribStackColorBuffer[gl];
        stackPrev = stack.pop();
        stack     = stack[stack.length - 1];

        //clearColor
        attribPrev = stackPrev[0];
        attrib     = stack[0];

        var r = attrib[0];
        var g = attrib[1];
        var b = attrib[2];
        var a = attrib[3];

        if(r != attribPrev[0] ||
           g != attribPrev[1] ||
           b != attribPrev[2] ||
           a != attribPrev[3]){
            gl.clearColor(r,g,b,a);
        }
    }

    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        stack     = attribStackScissor[gl];
        stackPrev = stack.pop();
        stack     = stack[stack.length - 1];

        //SCISSOR_TEST
        attribPrev = stackPrev[0];
        attrib     = stack[0];

        if(attrib != attribPrev){
            attrib ? gl.enable(gl.SCISSOR_TEST) : gl.disable(gl.SCISSOR_TEST);
        }

        attribPrev = stackPrev[1];
        attrib     = stack[1];

        //scissor box
        var x = attrib[0];
        var y = attrib[1];
        var width  = attrib[2];
        var height = attrib[3];

        if(x != attribPrev[0] ||
           y != attribPrev[1] ||
           width  != attribPrev[2] ||
           height != attribPrev[3]){
            gl.scissor(x,y,width,height);
        }
    }
};

pgl.getAttrib = function(mask, out){
    out = out || [];
    var gl = this._gl;
    if((mask & VIEWPORT_BIT) == VIEWPORT_BIT){
        out.push(attribViewport[gl].slice());
    }
    if((mask & COLOR_BUFFER_BIT) == COLOR_BUFFER_BIT){
        out.push(attribColorBuffer[gl].slice());
    }
    if((mask & SCISSOR_BIT) == SCISSOR_BIT){
        out.push(attribScissor[gl].slice());
    }

    return out;
};

pgl.enable = function(cap){
    var gl   = this._gl;
    var mask = attribMaskLast[gl];
    var attrib;

    if((COLOR_BUFFER_BIT & mask) == COLOR_BUFFER_BIT){
        attrib = attribColorBuffer[gl];
    }

    if((SCISSOR_BIT & mask) == SCISSOR_BIT){
        attrib = attribScissor[gl];
        attrib[0] = cap == gl.SCISSOR_TEST ? true : attrib[0];
    }

    gl.enable(cap);
};

pgl.disable = function(cap){
    var gl = this._gl;
    var mask = attribMaskLast[gl];
    var attrib;

    if((COLOR_BUFFER_BIT & mask) == COLOR_BUFFER_BIT){
        attrib = attribColorBuffer[gl];
    }

    if((SCISSOR_BIT & mask) == SCISSOR_BIT){
        attrib = attribScissor[gl];
        if(cap == gl.SCISSOR_TEST){
            attrib[0] = true;
        }
    }

    gl.disable(cap);
};


pgl.clearColor = function(r,g,b,a){
    var gl = this._gl;
    var attrib = attribColorBuffer[gl][0];
    attrib[0] = r;
    attrib[1] = g;
    attrib[2] = b;
    attrib[3] = a;
    this._gl.clearColor(r,g,b,a);
};

pgl.clearColorv = function(color){
    pgl.clearColor(color[0],color[1],color[2],color[3]);
};

pgl.viewport = function(x,y,width,height){
    var gl = this._gl;
    var attrib = attribViewport[gl][0];
    attrib[0] = x;
    attrib[1] = y;
    attrib[2] = width;
    attrib[3] = height;
    gl.viewport(x,y,width,height);
};

pgl.viewportv = function(viewport){
    this.viewport(viewport[0],viewport[1],viewport[2],viewport[3]);
};

pgl.depthRange = function(zNear,zFar){
    var gl = this._gl;
    var attrib = attribViewport[gl][1];
    attrib[0] = zNear;
    attrib[1] = zFar;
    gl.depthRange(zNear,zFar);
};

pgl.scissor = function(x,y,width,height){
    var gl = this._gl;
    var attrib = attribScissor[gl][1];
    attrib[0] = x;
    attrib[1] = y;
    attrib[2] = width;
    attrib[3] = height;
    gl.scissor(x,y,width,height);
};

pgl.scissorv = function(scissorbox){
    pgl.scissor(scissorbox[0],scissorbox[1],scissorbox[2],scissorbox[3]);
};

/*---------------------------------------------------------------------------------------------------------*/
// Matrices methods
/*---------------------------------------------------------------------------------------------------------*/

pgl.setWindowMatrices = function(width,height,topLeft){
    var gl = this._gl;
    matrixView[gl].identity();
    matrixProjection[gl].identity();
    matrixModelView[gl].identity();
    if(topLeft === undefined || topLeft){
        glu.ortho(matrixProjection[gl].m,0,width,height,0,-1,1);
    } else {
        glu.ortho(matrixProjection[gl].m,0,width,0,height,-1,1);
    }
};

pgl.setCameraMatrices = function(camera){
    matrixView[gl].set(camera.viewMatrix);
    matrixModelView[gl].set(camera.viewMatrix);
    matrixProjection[gl].set(camera.projectionMatrix);
};

pgl.setMatrixMode = function(mode){
    matrixMode[gl] = mode;
};

pgl.getProjectionMatrix = function(out){
    return (out || MATRIX44_TEMP).set(matrixProjection[this._gl]);
};

pgl.getViewMatrix = function(out){
    return (out || MATRIX44_TEMP).set(matrixView[this._gl]);
};

pgl.getModelViewMatrix = function(out){
    return (out || MATRIX44_TEMP).set(matrixModelView[this._gl]);
};

//function getNormalMatrix_(){
//    var gl = this._gl;
//    if(matrixNormalDirty[gl]){
//        matrixModelView[gl].toMatrix33(matrixNormal[gl]).invert().transpose();
//        matrixNormalDirty[gl] = false;
//    }
//    return matrixNormal[gl];
//};

//pgl.getNormalMatrix = function(out){
//    return (out || MATRIX33_TEMP).set(getNormalMatrix_());
//}

pgl.getProjectionMatrixF32 = function(out){
    return matrixProjection[this._gl].toFloat32Array(out || MATRIX44_F32_TEMP);
};

pgl.getViewMatrixF32 = function(out){
    return matrixView[this._gl].toFloat32Array(out || MATRIX44_F32_TEMP);
};

pgl.getModelViewMatrixF32 = function(out){
    return matrixModelView[this._gl].toFloat32Array(out || MATRIX44_F32_TEMP);
};

//pgl.getNormalMatrixF32 = function(out){
//    return this.getNormalMatrix().toFloat32Array(out || MATRIX33_F32_TEMP);
//};

pgl.getMatrixF32 = function(out){
    return matrixMode[this._gl] == MODELVIEW ? this.getModelViewMatrixF32(out) : this.getProjectionMatrixF32(out);
};

pgl.loadIdenitiy = function(){
    var gl = this._gl;
    (matrixMode[gl] == MODELVIEW ? matrixModelView[gl] : matrixProjection[gl]).identity();
};

pgl.pushMatrix = function(){
    var gl = this._gl;
    if(matrixMode[gl] == MODELVIEW){
        matrixStackModelView[gl].push(matrixModelView[gl].copy());
    } else {
        matrixStackProjection[gl].push(matrixProjection[gl].copy());
    }
};

pgl.popMatrix = function(){
    var gl = this._gl;
    if(matrixMode[gl] == MODELVIEW){
        if(matrixStackModelView[gl].length == 0){
            throw new Error('Matrix stack invalid pop.');
        }
        matrixModelView[gl] = matrixStackModelView[gl].pop();
        return matrixModelView[gl];
    } else {
        if(matrixStackProjection[gl].length == 0){
            throw new Error('Matrix stack invalid pop.');
        }
        matrixProjection[gl] = matrixStackProjection[gl].pop();
        return matrixProjection[gl];
    }
};

pgl.pushMatrices = function(){
    var gl = this._gl;
    matrixStackModelView[gl].push(matrixModelView[gl].copy());
    matrixStackProjection[gl].push(matrixProjection[gl].copy());
};

pgl.popMatrices = function(){
    var gl = this._gl;
    if(matrixStackModelView[gl].length == 0 || matrixStackProjection[gl].length == 0){
        throw new Error('Matrix stack invalid pop.');
    }
    matrixModelView[gl]  = matrixStackModelView[gl].pop();
    matrixProjection[gl] = matrixStackProjection[gl].pop();
};

pgl.multMatrix = function(matrix){
    var gl = this._gl;
    (matrixMode[gl] == MODELVIEW ? matrixModelView[gl] : matrixProjection[gl]).mult(matrix);
    matrixNormalDirty[gl] = true;
};

pgl.translate3 = function(x,y,z){
    var gl = this._gl;
    matrixModelView[gl].translatef(x,y,z);
    matrixNormalDirty[gl] = true;
};

pgl.translatev = function(v){
    this.translate3(v[0],v[1],v[2]);
};

pgl.scale3 = function(x,y,z){
    var gl = this._gl;
    matrixModelView[gl].scalef(x,y,z);
    matrixNormalDirty[gl] = true;
};

pgl.scale1 = function(x){
    var gl = this._gl;
    matrixModelView[gl].scalef(x,x,x);
    matrixNormalDirty[gl] = true;
};

pgl.scalev = function(v){
    this.scale3(v[0],v[1],v[2]);
};

pgl.rotate3 = function(x,y,z){
    var gl = this._gl;
    matrixModelView[gl].rotatef(x,y,z);
    matrixNormalDirty[gl] = true;
};

pgl.rotatev = function(v){
    this.rotate3(v[0],v[1],v[2]);
};

pgl.rotateAxis3 = function(angle,x,y,z){
    var gl = this._gl;
    matrixModelView[gl].rotateFromAxisf(angle,x,y,z);
    matrixNormalDirty[gl] = true;
};

pgl.rotateAxixv = function(angle,v){
    this.rotateAxis3(angle,v[0],v[1],v[2]);
};

pgl.drawMesh = function(mesh){};
pgl.drawMeshv = function(meshes){};


pgl.MODELVIEW = MODELVIEW;
pgl.PROJECTION = PROJECTION;

module.exports = pgl;