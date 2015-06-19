var DefaultAttributeLocationBinding = require('./ProgramAttributeLocationBinding');

//TODO: this is true in 99% of cases, might be implementation specific
var MaxVertexAttributes = 16;

function Program(context, vertSrc, fragSrc, attributeLocationBinding) {
    var gl = this._gl = context.getGL();

    //TODO: creating program once like Pex or on every load like Foam
    //If we don't do this in init then bind() can be invalid and it should throw
    this._handle = gl.createProgram();
    this._attributes = {};
    this._uniforms = {};
    if (vertSrc) {
        this.update(vertSrc, fragSrc, attributeLocationBinding);
    }
}

Program.prototype.bind = function() {
    var gl = this._gl;
    gl.useProgram(this._handle);
}

Program.prototype.unbind = function() {
    var gl = this._gl;
    //TODO: How Program.unbind works? We no longer have bind()/unbind() at all? And we do ctx.bindProgram(program);
    gl.useProgram(null);
};

/**
 * updates ahders sources and links the program
 * @param  {String} vertSrc                 - vert shader source (or combined vert/fragShader)
 * @param  {String} [fragSrc]               - frag shader source
 * @param  {String} [attributeLocationBinding] - attribute locations map { 0: 'aPositon', 1: 'aNormal', 2: 'aColor' }
 */
Program.prototype.update = function(vertSrc, fragSrc, attributeLocationBinding) {
    var gl = this._gl;
    var program = this._handle;

    var vertShader = this._compileVertexSource(vertSrc);
    var fragShader = this._compileFragmentSource(fragSrc);

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    for(var location = 0; location < MaxVertexAttributes; location++) {
        var attributeName = (attributeLocationBinding && attributeLocationBinding[location]) || DefaultAttributeLocationBinding[location];
        gl.bindAttribLocation(program, location, attributeName);
    }

    gl.linkProgram(program);

    gl.detachShader(program, vertShader);
    gl.detachShader(program, fragShader);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('PROGRAM: ' + gl.getProgramInfoLog(program));
    }

    this._updateUniforms();
    this._updateAttributes();
}

Program.prototype._updateUniforms = function() {
    var gl          = this._gl;
    var program     = this._handle;
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    var uniforms    = this._uniforms = {};

    for(var i = 0, info, name; i < numUniforms; ++i){
        info = gl.getActiveUniform(program, i);
        name = info.name;
        uniforms[name] = {
            type     : info.type,
            location : gl.getUniformLocation(program, name)
        };
    }
}

Program.prototype._updateAttributes = function() {
  var gl            = this._gl;
  var program       = this._handle;
  var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  var attributes    = this._attributes = {};

  for(var i = 0, info, name; i < numAttributes; ++i){
      info = gl.getActiveAttrib(program, i);
      name = info.name;
      attributes[name] = {
          type     : info.type,
          location : gl.getAttribLocation(program, name)
      }
  }
  return attributes;
}

Program.prototype._compileVertexSource = function(vertSrc) {
    var gl = this._gl;

    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, vertSrc + '\n');
    gl.compileShader(vertShader);
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw new Error('VERTEX: ' + gl.getShaderInfoLog(this.vertShader));
    }
    return vertShader;
};

Program.prototype._compileFragmentSource = function(fragSrc) {
    var gl = this._gl;
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSrc + '\n');
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw new Error('FRAGMENT: ' + gl.getShaderInfoLog(fragShader));
    }
    return fragShader;
};

Program.prototype.setUniform = function(name, args) {
    var uniform = this._uniforms[name];
    if (uniform === undefined){
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
            gl.uniform1i(location,arguments[1]);
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
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            if(numArgs == 1){
                gl.uniform2fv(location,arguments[1]);
            } else {
                gl.uniform2f(location,arguments[1],arguments[2]);
            }
            break;
        case gl.FLOAT_VEC3:
            if(numArgs != 1 && numArgs != 3){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
            }
            if(numArgs == 1){
                gl.uniform3fv(location,arguments[1]);
            } else {
                gl.uniform3f(location,arguments[1],arguments[2],arguments[3]);
            }
            break;
        case gl.FLOAT_VEC4:
            if(numArgs != 1 && numArgs != 4){
                throw new Error(STR_ERROR_WRONG_NUM_ARGS);
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
}

Program.prototype.dispose = function(){
    if(!this._handle) {
        return this;
    }
    this._gl.deleteProgram(this._handle);
    this._handle = null;
    return this;
};

module.exports = Program;
