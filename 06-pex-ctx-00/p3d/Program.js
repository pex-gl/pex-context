var DefaultAttributeLocationBinding = require('./ProgramAttributeLocationBinding');

//TODO: this is true in 99% of cases, might be implementation specific
var NUM_VERTEX_ATTRIBUTES_MAX = 16;

var STR_ERROR_UNIFORM_UNDEFINED = 'Uniform "%s" is not defined.';
var STR_ERROR_WRONG_NUM_ARGS = 'Wrong number of arguments.';
var STR_ERROR_INVALID_UNIFORM_TYPE = 'Unsupported uniform type "%s".';
var STR_ERROR_ATTRIBUTE_BINDING_UNDEFINED = 'Attribute "%s" is not present in program.';

function Program(context, vertSrc, fragSrc, attributeLocationBinding){
    var gl = this._gl = context.getGL();

    this._handle           = gl.createProgram();
    this._attributes       = {};
    this._uniforms         = {};
    this._uniformSetterMap = {};
    if(vertSrc){
        this.update(vertSrc, fragSrc, attributeLocationBinding);
    }
}

Program.prototype.getHandle = function(){
    return this._handle;
};

Program.prototype._bindInternal = function(){
    this._gl.useProgram(this._handle);
};

/**
 * updates shaders sources and links the program
 * @param  {String} vertSrc                 - vert shader source (or combined vert/fragShader)
 * @param  {String} [fragSrc]               - frag shader source
 * @param  {String} [attributeLocationBinding] - attribute locations map { 0: 'aPositon', 1: 'aNormal', 2: 'aColor' }
 */
Program.prototype.update = function(vertSrc, fragSrc, attributeLocationBinding){
    var gl = this._gl;
    var program = this._handle;

    var vertShader = this._compileSource(gl.VERTEX_SHADER, vertSrc);
    var fragShader = this._compileSource(gl.FRAGMENT_SHADER, fragSrc);

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    for(var location = 0; location < NUM_VERTEX_ATTRIBUTES_MAX; location++){
        var attributeName = (attributeLocationBinding && attributeLocationBinding[location]) || DefaultAttributeLocationBinding[location];
        gl.bindAttribLocation(program, location, attributeName);
    }

    gl.linkProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw new Error('PROGRAM: ' + gl.getProgramInfoLog(program));
    }

    //Mark for deletion, they are not actually deleted until you call deleteProgram() in dispose()
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    this._updateUniforms();
    this._updateAttributes();

    for(var location in attributeLocationBinding){
        var attributeName = attributeLocationBinding[location];
        if(this._attributes[attributeName] === undefined){
            throw new Error(STR_ERROR_ATTRIBUTE_BINDING_UNDEFINED.replace('%s', attributeName));
        }
    }

    this._updateUniformSetterMap();
};

Program.prototype._updateUniforms = function(){
    var gl = this._gl;
    var program     = this._handle;
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniforms    = this._uniforms = {};

    for(var i = 0, info, name; i < numUniforms; ++i){
        info = gl.getActiveUniform(program, i);
        name = info.name;
        uniforms[name] = {
            type : info.type,
            location : gl.getUniformLocation(program, name)
        };
    }
};

Program.prototype._updateAttributes = function(){
    var gl = this._gl;
    var program       = this._handle;
    var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    var attributes    = this._attributes = {};

    for(var i = 0, info, name; i < numAttributes; ++i){
        info = gl.getActiveAttrib(program, i);
        name = info.name;
        attributes[name] = {
            type : info.type,
            location : gl.getAttribLocation(program, name)
        }
    }
};

Program.prototype._compileSource = function(type, src){
    var gl = this._gl;
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src + '\n');
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        throw new Error((type === gl.VERTEX_SHADER ? 'Vertex ' : 'Fragment ') + 'shader: ' + gl.getShaderInfoLog(shader));
    }
    return shader;
};

Program.prototype._updateUniformSetterMap = function(){
    var gl = this._gl;

    this._uniformSetterMap = {};
    for(var entry in this._uniforms){
        var type = this._uniforms[entry].type;
        if(this._uniformSetterMap[type] === undefined){
            switch (type){
                case gl.INT:
                case gl.BOOL:
                case gl.SAMPLER_2D:
                case gl.SAMPLER_CUBE:
                    this._uniformSetterMap[gl.INT] = this._uniformSetterMap[gl.INT] || function(location,x,y,z,w){
                        if(x === undefined || y !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        gl.uniform1i(location,x);
                    };
                    this._uniformSetterMap[type] = this._uniformSetterMap[gl.INT];
                    break;
                case gl.FLOAT:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || y !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        gl.uniform1f(location,x);
                    };
                    break;
                case gl.FLOAT_VEC2:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || z !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        if(y === undefined){
                            gl.uniform2fv(location,x);
                        }
                        else {
                            gl.uniform2f(location,x,y);
                        }
                    };
                    break;
                case gl.FLOAT_VEC3:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || w !== undefined || (y !== undefined && z === undefined)){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        if(y === undefined){
                            gl.uniform3fv(location,x);
                        }
                        else {
                            gl.uniform3f(location,x,y,z);
                        }
                    };
                    break;
                case gl.FLOAT_VEC4:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || (y !== undefined && z === undefined) || (z !== undefined && w === undefined)){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        if(y === undefined){
                            gl.uniform4fv(location,x);
                        }
                        else {
                            gl.uniform4f(location,x,y,z,w);
                        }
                    };
                    break;
                case gl.FLOAT_MAT2:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || y !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        gl.uniformMatrix2fv(location,false,x);
                    };
                    break;
                case gl.FLOAT_MAT3:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || y !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        gl.uniformMatrix3fv(location,false,x);
                    };
                    break;
                case gl.FLOAT_MAT4:
                    this._uniformSetterMap[type] = function(location,x,y,z,w){
                        if(x === undefined || y !== undefined){
                            throw new Error(STR_ERROR_WRONG_NUM_ARGS);
                        }
                        gl.uniformMatrix4fv(location,false,x);
                    };
                    break;
                default:
                    throw new Error(STR_ERROR_INVALID_UNIFORM_TYPE.replace('%s',type));
                    break;
            }
        }
    }

};

Program.prototype.setUniform = function(name, x, y, z, w){
    var uniform = this._uniforms[name];
    if(uniform === undefined){
        throw new Error(STR_ERROR_UNIFORM_UNDEFINED.replace('%s', name));
    }
    this._uniformSetterMap[uniform.type](uniform.location,x,y,z,w);
};

Program.prototype.hasUniform = function(name){
    return this._uniforms[name] !== undefined;
};

Program.prototype.dispose = function(){
    if(!this._handle){
        return this;
    }
    this._gl.deleteProgram(this._handle);
    this._handle = null;
    return this;
};

module.exports = Program;
