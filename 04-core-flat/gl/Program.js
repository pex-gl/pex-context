var Window = require('../sys/Window');
var Id     = require('../sys/Id');
var Stack  = require('./Stack');

var stack = {};

var STR_ERROR_UNIFORM_UNDEFINED = 'Uniform "%s" is not defined.';
var STR_ERROR_WRONG_NUM_ARGS = 'Wrong number of arguments.';
var STR_ERROR_INVALID_UNIFORM_TYPE = 'Invalid uniform type "%s".';
var STR_ERROR_WRONG_UNIFORM_TYPE = 'Wrong uniform type "%s".';
var STR_ERROR_ATTRIBUTE_UNDEFINED = 'Attribute "%s" is not defined.';

var PREFIX_VERTEX_SHADER   = '#define VERTEX_SHADER\n';
var PREFIX_FRAGMENT_SHADER = '#define FRAGMENT_SHADER\n';

function Program(vertSrc,fragSrc,attribLocationsToBind){
    var gl = this._gl = Window.getCurrentContext();
    stack[gl.id] = stack[gl.id] === undefined ? new Stack() : stack[gl.id];

    this._handle = null;
    this._attributes = {};
    this._numAttributes = 0;
    this._uniforms = {};
    this._numUniforms = 0;
    this._uniformPresets = {};
    this._id = null;
    if(vertSrc){
        this.load(vertSrc,fragSrc,attribLocationsToBind);
    }
}

Program.prototype.bind = function(){
    var gl = this._gl;
    var stack_ = stack[gl.id];

    var prev = stack_.peek();
    stack_.push(this);

    if(prev == this){
        return;
    }

    gl.useProgram(this._handle);

    //var presets  = this._uniformPresets;
    //for(var preset in presets){
    //    this.uniform(preset,presets[preset]);
    //}
};

Program.prototype.unbind = function(){
    var gl = this._gl;
    var stack_ = stack[gl.id];

    var prev = stack_.pop();
    if(prev == this){
        return;
    }
    gl.useProgram(prev._handle);
};


Program.prototype.uniform = function(name,args){
    var uniform = this._uniforms[name];
    if(uniform === undefined){
        throw new Error(STR_ERROR_UNIFORM_UNDEFINED.replace('%s',name));
    }
    var type     = uniform.type;
    var location = uniform.location;
    var numArgs  = arguments.length - 1;
    var gl       = this._gl;

    switch (type){
        case gl.INT:
        case gl.BOOL:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniform1i(location,arguments[10]);
            break;
        case gl.SAMPLER_2D:
        case gl.SAMPLER_CUBE:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniform1i(location,arguments[1]);
            //but could also be texture
            break;
        case gl.FLOAT:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniform1f(location,arguments[1]);
            break;
        case gl.FLOAT_VEC2:
            if(numArgs != 1 && numArgs != 2){
                throw new Error(STR_ERROR_UNIFORM_UNDEFINED);
            }
            if(numArgs == 1){
                gl.uniform2fv(location,arguments[1]);
            } else {
                gl.uniform2f(location,arguments[1],arguments[2]);
            }
            break;
        case gl.FLOAT_VEC3:
            if(numArgs != 1 && numArgs != 3){
                throw new Error(STR_ERROR_UNIFORM_UNDEFINED);
            }
            if(numArgs == 1){
                gl.uniform3fv(location,arguments[1]);
            } else {
                gl.uniform3f(location,arguments[1],arguments[2],arguments[3]);
            }
            break;
        case gl.FLOAT_VEC4:
            if(numArgs != 1 && numArgs != 4){
                throw new Error(STR_ERROR_UNIFORM_UNDEFINED);
            }
            if(numArgs == 1){
                gl.uniform4fv(location,arguments[1]);
            } else {
                gl.uniform4f(location,arguments[1],arguments[2],arguments[3],arguments[4]);
            }
            break;
        case gl.FLOAT_MAT2:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniformMatrix2fv(location,false,arguments[1]);
            break;
        case gl.FLOAT_MAT3:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniformMatrix3fv(location,false,arguments[1]);
            break;
        case gl.FLOAT_MAT4:
            if(numArgs != 1){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            gl.uniformMatrix4fv(location,false,arguments[1]);
            break;
        default :
            throw new Error(STR_ERROR_INVALID_UNIFORM_TYPE.replace('%s',type));
            break;
    }

    //if(this._uniformPresets[name]){
    //   this._setUniformPreset(na)
    //}
};


Program.prototype._setUniformPreset = function(name,args){

};

Program.prototype.uniformPreset = function(name,args){
    if(!this._uniforms[name]){
        throw new Error(STR_ERROR_UNIFORM_UNDEFINED.replace('%s',name));
    }
    this._uniformPresets[name] = args;
};

Program.prototype.getUniformPreset = function(name){
    return this._uniformPresets[name];
};

Program.prototype.removeUniformPreset = function(name){
    if(!this._uniformPresets[name]){
        throw new Error(STR_ERROR_UNIFORM_UNDEFINED.replace('%s',name));
    }
    delete this._uniformPresets[name];
};

Program.prototype.getUniformInfo = function(name){
    var uniform = this._uniforms[name];
    if(uniform === undefined){
        throw new Error(STR_ERROR_UNIFORM_UNDEFINED.replace('%s',name));
    }
    return uniform;
};

Program.prototype.getUniformType = function(name){
    return this.getUniformInfo(name).type;
};

Program.prototype.getUniformLocation = function(name){
    return this.getUniformInfo(name).location;
};

Program.prototype.getUniforms = function(){
    return this._uniforms;
};

Program.prototype.getNumUniforms = function(){
    return this._numUniforms;
};

Program.prototype.hasUniform = function(name){
    return this._uniforms[name] !== undefined;
};

Program.prototype.getAttribInfo = function(name){
    var attribute = this._attributes[name];
    if(attribute === undefined){
        throw new Error(STR_ERROR_ATTRIBUTE_UNDEFINED.replace('%s',name));
    }
    return attribute;
};

Program.prototype.getAttributes = function(){
    return this._attributes;
};

Program.prototype.hasAttribute = function(name){
    return this._attributes[name] !== undefined;
};

Program.prototype.getAttribLocation = function(name){
    return this.getAttribInfo(name).location;
};

Program.prototype.getAttribType = function(name){
    return this.getAttribInfo(name).type;
};

Program.prototype.getNumAttributes = function(){
     return this._numAttributes;
};

Program.prototype.enableVertexAttribArray = function(name){
    var attribute = this._attributes[name];
    if(attribute === undefined){
        throw new Error(STR_ERROR_ATTRIBUTE_UNDEFINED.replace('%s',name));
    }
    this._gl.enableVertexAttribArray(attribute);
};

Program.prototype.disableVertexAttribArray = function(name){
    var attribute = this._attributes[name];
    if(attribute === undefined){
        throw new Error(STR_ERROR_ATTRIBUTE_UNDEFINED.replace('%s',name));
    }
    this._gl.disableVertexAttribArray(attribute);
};

Program.prototype.vertexAttribPointer = function(name,size,type,normalized,stride,offset){
    var attribtute = this._attributes[name];
    if(attribtute === undefined){
        throw new Error(STR_ERROR_ATTRIBUTE_UNDEFINED.replace('%s',name));
    }
    this._gl.vertexAttribPointer(attribtute,size,type,normalized,stride,offset);
};

Program.prototype.load = function(vertSrc,fragSrc,attribLocationsToBind){
    if(!vertSrc){
        return;
    }

    attribLocationsToBind = attribLocationsToBind === undefined ? {} : attribLocationsToBind;

    this.dispose();

    this._id = Id.get();
    var gl = this._gl;

    var prefixVertexShader = '';
    var prefixFragmentShader = '';

    if(!fragSrc){
        prefixVertexShader   = PREFIX_VERTEX_SHADER;
        prefixFragmentShader = PREFIX_FRAGMENT_SHADER;
        fragSrc = vertSrc;
    }

    var program    = this._handle = gl.createProgram();
    var vertShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, prefixVertexShader + vertSrc);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw new Error('VERTEX: ' + gl.getShaderInfoLog(vertShader));
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragShader, prefixFragmentShader + fragSrc);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw new Error('FRAGMENT: ' + gl.getShaderInfoLog(fragShader));
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    for(var location in attribLocationsToBind){
        gl.bindAttribLocation(program, location, attribLocationsToBind[location]);
    }

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        throw new Error('PROGRAM: ' + gl.getProgramInfoLog(program));
    }

    var numUniforms = this._numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniforms    = this._uniforms = {};

    for(var i = 0, info, name; i < numUniforms; ++i){
        info = gl.getActiveUniform(program,i);
        name = info.name;
        uniforms[name] = {
            type     : info.type,
            location : gl.getUniformLocation(program, name)
        };
    }

    var numAttributes = this._numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    var attributes    = this._attributes = {};

    for(var i = 0, info, name; i < numAttributes; ++i){
        info = gl.getActiveAttrib(program,i);
        name = info.name;
        attributes[name] = {
            type     : info.type,
            location : gl.getAttribLocation(program,name)
        }
    }
};

Program.prototype.dispose = function(){
    if(!this._handle){
        return this;
    }
    this._gl.deleteProgram(this._handle);
    this._handle = null;
    return this;
};

Program.__getStack = function(){
    return stack;
};

module.exports = Program;