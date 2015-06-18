var DefaultAttributeLocationMap = {
    0 : 'aPosition',
    1 : 'aColor',
    2 : 'aTexCoord0',
    3 : 'aTexCoord1',
    4 : 'aTexCoord2',
    5 : 'aTexCoord3',
    6 : 'aNormal',
    7 : 'aBitangent',
    8 : 'aBoneIndex',
    9 : 'aBoneWeight',
    10 : 'aCustom0',
    11 : 'aCustom1',
    12 : 'aCustom2',
    13 : 'aCustom3',
    14 : 'aCustom4',
    15 : 'aCustom5'
}

//TODO: this is true in 99% of cases, might be implementation specific
var MaxVertexAttributes = 16;

function Program(context, vertSrc, fragSrc, attributeLocationsMap) {
    var gl = this._gl = context.getGL();

    //TODO: creating program once like Pex or on every load like Foam
    //If we don't do this in init then bind() can be invalid and it should throw
    this._handle = gl.createProgram();
    this._attributes = {};
    this._uniforms = {};
    if (vertSrc) {
        this.update(vertSrc, fragSrc, attributeLocationsMap);
    }
}

Program.prototype.bind = function() {
  gl.useProgram(this._handle);
}

Program.prototype.unbind = function() {
    //TODO: How Program.unbind works? We no longer have bind()/unbind() at all? And we do ctx.bindProgram(program);
    gl.useProgram(null);
};

/**
 * updates ahders sources and links the program
 * @param  {String} vertSrc                 - vert shader source (or combined vert/fragShader)
 * @param  {String} [fragSrc]               - frag shader source
 * @param  {String} [attributeLocationsMap] - attribute locations map { 0: 'aPositon', 1: 'aNormal', 2: 'aColor' }
 */
Program.prototype.update = function(vertSrc, fragSrc, attributeLocationsMap) {
    var gl = this._gl;
    var program = this._handle;

    var vertShader = this._compileVertexSource(vertSrc);
    var fragShader = this._compileFragmentSource(fragSrc);

    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);

    for(var location = 0; location < MaxVertexAttributes; location++) {
        var attributeName = (attributeLocationsMap && attributeLocationsMap[location]) || DefaultAttributeLocationMap[location];
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
    gl.shaderSource(this.vertShader, vertSrc + '\n');
    gl.compileShader(this.vertShader);
    if (!gl.getShaderParameter(this.vertShader, gl.COMPILE_STATUS)) {
        throw new Error('VERTEX: ' + gl.getShaderInfoLog(this.vertShader));
    }
    return vertShader;
};

Program.prototype._compileVertexSource = function(fragSrc) {
    var gl = this._gl;
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragSrc + '\n');
    gl.compileShader(fragShader);
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        throw new Error('FRAGMENT: ' + gl.getShaderInfoLog(fragShader));
    }
    return fragShader;
};

Program.prototype.dispose = function(){
    if(!this._handle) {
        return this;
    }
    this._gl.deleteProgram(this._handle);
    this._handle = null;
    return this;
};

module.exports = Program;
