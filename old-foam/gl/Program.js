var _gl = require('./gl'),
    Id  = require('../system/Id'),
    ObjectUtil = require('../util/ObjectUtil');

/**
 * GLSL shader program wrapper.
 * @param {String} [vertexShader] - The vertex shader or mixed vertex/fragment shader string
 * @param {String} [fragmentShader] - The fragment shader string
 * @constructor
 */

function Program(vertexShader, fragmentShader) {
    var gl = this._gl = _gl.get();
    this._obj = null;
    this._id  = null;
    this._numAttributes = this._numUniforms = 0;
    this._attributes = this._uniforms = null;
    this.load(vertexShader,fragmentShader);
}

/**
 * The default shader projection matrix uniform. (reassignable)
 * @type {string}
 * @static
 */

Program.UNIFORM_PROJECTION_MATRIX = 'uProjectionMatrix';

/**
 * The default shader view matrix uniform. (reassignable)
 * @type {string}
 * @static
 */

Program.UNIFORM_VIEW_MATRIX = 'uViewMatrix';

/**
 * The default shader modelview matrix uniform. (reassignable)
 * @type {string}
 * @static
 */

Program.UNIFORM_MODELVIEW_MATRIX  = 'uModelViewMatrix';

/**
 * The default shader normal matrix uniform. (reassignable)
 * @type {string}
 * @static
 */

Program.UNIFORM_NORMAL_MATRIX = 'uNormalMatrix';

/**
 * The default shader vertex position attribute. (reassignable)
 * @type {string}
 * @static
 */

Program.ATTRIB_VERTEX_POSITION = 'aVertexPosition';

/**
 * The default shader vertex position offset attribute (reassignable)
 * @type {string}
 * @static
 */

Program.ATTRIB_VERTEX_OFFSET = 'aVertexOffset';

/**
 * The default shader vertex normal attribute. (reassignable)
 * @type {string}
 * @static
 */

Program.ATTRIB_VERTEX_NORMAL = 'aVertexNormal';

/**
 * The default shader vertex color attribute. (reassignable)
 * @type {string}
 * @static
 */

Program.ATTRIB_VERTEX_COLOR = 'aVertexColor';

/**
 * The default shader texcoord attribute. (reassignable)
 * @type {string}
 */

Program.ATTRIB_TEXCOORD = 'aTexcoord';

/**
 * The default shader color uniform. (reassignable)
 * @type {string}
 */

Program.UNIFORM_COLOR = 'uColor';

/**
 * The default shader sampler2d uniform. (reassignable)
 * @type {string}
 */

Program.UNIFORM_TEXTURE = 'uTexture';

/**
 * The default shader point size uniform. (reassignable)
 * @type {string}
 */

Program.UNIFORM_POINT_SIZE = 'uPointSize';

/**
 * The default shader light uniform. Lights are structs. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT = 'uLights';

/**
 * The default shader light trigger uniform. (reassignable)
 * @type {string}
 */

Program.UNIFORM_USE_LIGHTING = 'uUseLighting';

/**
 * The default shader light struct position property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_POSITION_SUFFIX = 'position';

/**
 * The default shader light struct ambient property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_AMBIENT_SUFFIX = 'ambient';


/**
 * The default shader light struct diffuse property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_DIFFUSE_SUFFIX = 'diffuse';

/**
 * The default shader light struct specular property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_SPECULAR_SUFFIX = 'specular';

/**
 * The default shader light struct constant attentuation property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_CONSTANT_ATT = 'constantAttenuation';

/**
 * The default shader light struct linear attentuation property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_LINEAR_ATT = 'linearAttenuation';

/**
 * The default shader light struct quadric attentuation property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_LIGHT_STRUCT_QUADRIC_ATT = 'quadraticAttenuation';

/**
 * The default shader light uniform. Materials are structs. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT = 'uMaterial';

/**
 * The default shader material struct emission property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT_EMISSION = 'emission';

/**
 * The default shader material struct ambient property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT_AMBIENT = 'ambient';

/**
 * The default shader material struct diffuse property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT_DIFFUSE = 'diffuse';

/**
 * The default shader material struct specular property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT_SPECULAR = 'specular';

/**
 * The default shader material struct shininess property. (reassignable)
 * @type {string}
 */

Program.UNIFORM_MATERIAL_STRUCT_SHININESS = 'shininess';

/**
 * The default shader skybox uniform. (reassignable)
 * @type {string}
 * @static
 */

Program.UNIFORM_SKYBOX = 'uSkybox';

var currProgram = null,
    prevProgram = null;

/**
 * Return the currently bound program.
 * @returns {null|Program}
 */

Program.getCurrent = function(){
    return currProgram;
};

/**
 * Reload the program
 * @param {String} vertexShader - The vertex shader or mixed vertex/fragment shader string
 * @param {String} [fragmentShader] - The fragment shader string
 */

Program.prototype.load = function(vertexShader,fragmentShader){
    if(!vertexShader){
        return;
    }

    this.dispose();

    var gl = this._gl;

    var prefixVertexShader = '',
        prefixFragmentShader = '';

    if(!fragmentShader){
        prefixVertexShader = '#define VERTEX_SHADER\n';
        prefixFragmentShader = '#define FRAGMENT_SHADER\n';
        fragmentShader = vertexShader;
    }

    var program    = this._obj = gl.createProgram(),
        vertShader = gl.createShader(gl.VERTEX_SHADER),
        fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.bindAttribLocation(this._obj, 0, Program.ATTRIB_VERTEX_POSITION);

    gl.shaderSource(vertShader, prefixVertexShader + vertexShader);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        throw new Error('VERTEX: ' + gl.getShaderInfoLog(vertShader));
    }

    gl.shaderSource(fragShader, prefixFragmentShader + fragmentShader);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw new Error('FRAGMENT: ' + gl.getShaderInfoLog(fragShader));
    }

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    var i, paramName;
    var objects, numObjects;

    numObjects = this._numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    objects = this._uniforms = {};
    i = -1;
    while (++i < numObjects) {
        paramName = gl.getActiveUniform(program, i).name;
        objects[paramName] = gl.getUniformLocation(program, paramName);
    }

    numObjects = this._numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    objects = this._attributes = {};
    i = -1;
    while (++i < numObjects) {
        paramName = gl.getActiveAttrib(program, i).name;
        objects[paramName] = gl.getAttribLocation(program, paramName);
    }

    this._id = Id.get();
};

/**
 * Returns the uniform location. -1 if not available. Checks against internal active uniforms.
 * @param uniform
 * @returns {number}
 */

Program.prototype.getUniformLocation = function(uniform){
    uniform = this._uniforms[uniform];
    return ObjectUtil.isUndefined(uniform) ? -1 : uniform;
};

/**
 * Returns the attribute location. -1 if not available. Checks against internal active attribs.
 * @param attribute
 * @returns {number}
 */

Program.prototype.getAttribLocation = function(attribute){
    attribute = this._attributes[attribute];
    return ObjectUtil.isUndefined(attribute) ? -1 : attribute;
};

/**
 * Returns true if the attribute is valid and active.
 * @param {String} [name] - The attribute name
 * @returns {boolean}
 */

Program.prototype.hasAttribute = function(name){
    return !ObjectUtil.isUndefined(this._attributes[name]);
};

/**
 * Returns true if the uniform is valid and active.
 * @param {String} [name] - The attribute name
 * @returns {boolean}
 */

Program.prototype.hasUniform = function(name){
    return !ObjectUtil.isUndefined(this._uniforms[name]);
};

/**
 * Returns all active attributes as map.
 * @returns {Object}
 */

Program.prototype.getAttributes = function(){
    return this._attributes;
};

/**
 * Returns all active uniforms as map.
 * @returns {Object}
 */
Program.prototype.getUniforms = function(){
    return this._uniforms;
};

/**
 * Get the number of active uniforms
 * @returns {Number}
 */

Program.prototype.getNumUniforms = function () {
    return this._numUniforms;
};

/**
 * Get the number of active attributes.
 * @returns {Number}
 */

Program.prototype.getNumAttributes = function () {
    return this._numAttributes;
};

/**
 * Activate the program.
 * @returns {Program}
 */

Program.prototype.bind = function () {
    var gl = this._gl;
    gl.useProgram(this._obj);
    var a = this._attributes;
    for(var k in a) {
        gl.enableVertexAttribArray(a[k]);
    }
    prevProgram = currProgram;
    currProgram = this;
    return this;
};

/**
 * Deactivate the program.
 * @returns {Program}
 */

Program.prototype.unbind = function () {
    var gl = this._gl;
    var a = this._attributes;
    for(var k in a) {
        gl.disableVertexAttribArray(a[k]);
    }
    this._gl.useProgram(prevProgram ? prevProgram.getObjGL() : prevProgram);
    currProgram = prevProgram;
    return this;
};

/**
 * Enables a vertex attribute array.
 * @param {String} name - The attribute name
 * @returns {Program}
 */

Program.prototype.enableVertexAttribArray = function(name){
    this._gl.enableVertexAttribArray(this._attributes[name]);
    return this;
};

/**
 * Disables a vertex attribute array.
 * @param {String} name - The attribute name
 * @returns {Program}
 */

Program.prototype.disableVertexAttribArray = function(name){
    this._gl.disableVertexAttribArray(this._attributes[name]);
    return this;
};

/**
 * Sets the locations and data formats  in a vertex attributes array.
 * @param {String} name - Target attribute name
 * @param {Number} size - Number of comps per attribute
 * @param {Number} {Number}type - Data type
 * @param {Boolean} normalized - If true, values are normalized when accessed
 * @param {Number}stride - Offset in bytes between vertex attributes
 * @param {Number} offset - Offset in bytes
 * @returns {Program}
 */

Program.prototype.vertexAttribPointer = function(name,size,type,normalized,stride,offset){
    this._gl.vertexAttribPointer(this._attributes[name],size,type,normalized,stride,offset);
    return this;
};

/**
 * Assigns a value of type float to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value
 * @returns {Program}
 */

Program.prototype.uniform1f = function(name,x){
    this._gl.uniform1f(this._uniforms[name],x);
    return this;
};

/**
 * Assigns a value of type 2d float to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @returns {Program}
 */

Program.prototype.uniform2f = function(name,x,y){
    this._gl.uniform2f(this._uniforms[name],x,y);
    return this;
};

/**
 * Assigns a value of type 3d float to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @param {Number} z - The value z
 * @returns {Program}
 */

Program.prototype.uniform3f = function(name,x,y,z){
    this._gl.uniform3f(this._uniforms[name],x,y,z);
    return this;
};

/**
 * Assigns a value of type 4d float to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @param {Number} z - The value z
 * @param {Number} w - The value w
 * @returns {Program}
 */

Program.prototype.uniform4f = function(name,x,y,z,w){
    this._gl.uniform4f(this._uniforms[name],x,y,z,w);
    return this;
};

/**
 * Assigns a value of type floating point vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Float32Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform1fv = function(name,v){
    this._gl.uniform1fv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type floating point vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Float32Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform2fv = function(name,v){
    this._gl.uniform2fv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type floating point vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Float32Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform3fv = function(name,v){
    this._gl.uniform3fv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type floating point vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Float32Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform4fv = function(name,v){
    this._gl.uniform4fv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type integer to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value
 * @returns {Program}
 */

Program.prototype.uniform1i = function(name,x){
    this._gl.uniform1i(this._uniforms[name],x);
    return this;
};

/**
 * Assigns a value of type 2d integer to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @returns {Program}
 */

Program.prototype.uniform2i = function(name,x,y){
    this._gl.uniform2i(this._uniforms[name],x,y);
    return this;
};

/**
 * Assigns a value of type 3d integer to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @param {Number} z - The value z
 * @returns {Program}
 */

Program.prototype.uniform3i = function(name,x,y,z){
    this._gl.uniform3i(this._uniforms[name],x,y,z);
    return this;
};

/**
 * Assigns a value of type 4d integer to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Number} x - The value x
 * @param {Number} y - The value y
 * @param {Number} z - The value z
 * @param {Number} w - The value w
 * @returns {Program}
 */

Program.prototype.uniform4i = function(name,x,y,z,w){
    this._gl.uniform4i(this._uniforms[name],x,y,z,w);
    return this;
};

/**
 * Assigns a value of type integer vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Uint8Array|Uint16Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform1iv = function(name,v){
    this._gl.uniform1iv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type integer vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Uint8Array|Uint16Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform2iv = function(name,v){
    this._gl.uniform2iv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type integer vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Uint8Array|Uint16Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform3iv = function(name,v){
    this._gl.uniform3iv(this._uniforms[name],v);
    return this;
};

/**
 * Assigns a value of type integer vector array to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Uint8Array|Uint16Array} v - The array
 * @returns {Program}
 */

Program.prototype.uniform4iv = function(name,v){
    this._gl.uniform4iv(this._uniforms[name],v);
    return this;
};


/**
 * Assigns a value of type 2x2 matrix to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Boolean} transpose - If true, the value gets transposed
 * @param {Float32Array} value - The matrix
 * @returns {Program}
 */

Program.prototype.uniformMatrix2fv = function(name,transpose,value){
    this._gl.uniformMatrix2fv(this._uniforms[name],transpose,value);
    return this;
};

/**
 * Assigns a value of type 3x3 matrix to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Boolean} transpose - If true, the value gets transposed
 * @param {Float32Array} value - The matrix
 * @returns {Program}
 */

Program.prototype.uniformMatrix3fv = function(name,transpose,value){
    this._gl.uniformMatrix3fv(this._uniforms[name],transpose,value);
    return this;
};

/**
 * Assigns a value of type 4x4 matrix to a uniform variable.
 * @param {String} name - The uniform name
 * @param {Boolean} transpose - If true, the value gets transposed
 * @param {Float32Array} value - The matrix
 * @returns {Program}
 */

Program.prototype.uniformMatrix4fv = function(name,transpose,value){
    this._gl.uniformMatrix4fv(this._uniforms[name],transpose,value);
    return this;
};

/**
 * Delete the program.
 * @returns {Program}
 */

Program.prototype.dispose = function(){
    if(!this._obj){
        return this;
    }
    this._gl.deleteProgram(this._obj);
    this._obj = null;
    return this;
};

/**
 * Returns a unique program id, reset on load.
 * @returns {Number}
 */

Program.prototype.getId = function(){
    return this._id;
};

/**
 * Returns the underlying gl object.
 * @returns {WebGLProgram}
 */

Program.prototype.getObjGL = function(){
    return this._obj;
};

Program.dispose = function(){
    if(currProgram){
        currProgram.dispose();
        currProgram = null;
    }
    if(prevProgram){
        prevProgram.dispose();
        prevProgram = null;
    }
};

module.exports = Program;
