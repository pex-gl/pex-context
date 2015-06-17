//Program implementation

var Promise = require('bluebird');

var kVertexShaderPrefix = '' +
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  '#define VERT\n';

var kFragmentShaderPrefix = '' +
  '#ifdef GL_ES\n' +
  '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
  '  precision highp float;\n' +
  '#else\n' +
  '  precision mediump float;\n' +
  '#endif\n' +
  '#endif\n' +
  '#define FRAG\n';

function Program(gl, vertSrc, fragSrc, debug) {
  this.gl = gl;
  this.handle = this.gl.createProgram();
  this.uniforms = {};
  this.attributes = {};

  if (vertSrc && vertSrc.then && fragSrc && fragSrc.then) {
    Promise.all([vertSrc, fragSrc]).then(function(sources) {
      if (debug) console.log(sources[0]);
      if (debug) console.log(sources[1]);
      this.addSources(sources[0], sources[1]);
      this.ready = false;
      if (this.vertShader && this.fragShader) {
        this.link();
      }
    }.bind(this))
  }
  else if (vertSrc && vertSrc.then) {
    Promise.all([vertSrc]).then(function(sources) {
      if (debug) console.log(sources[0]);
      this.addSources(sources[0], sources[0]);
      this.ready = false;
      if (this.vertShader && this.fragShader) {
        this.link();
      }
    }.bind(this))
  }
  else {
    this.addSources(vertSrc, fragSrc);
    this.ready = true;
    if (this.vertShader && this.fragShader) {
      this.link();
    }
  }
}

Program.prototype.addSources = function(vertSrc, fragSrc) {
  if (fragSrc == null) {
    fragSrc = vertSrc;
  }
  if (vertSrc) {
    this.addVertexSource(vertSrc);
  }
  if (fragSrc) {
    return this.addFragmentSource(fragSrc);
  }
};

Program.prototype.addVertexSource = function(vertSrc) {
  this.vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
  this.gl.shaderSource(this.vertShader, kVertexShaderPrefix + vertSrc + '\n');
  this.gl.compileShader(this.vertShader);
  if (!this.gl.getShaderParameter(this.vertShader, this.gl.COMPILE_STATUS)) {
    var err = this.gl.getShaderInfoLog(this.vertShader);
    console.log(err);
    throw new Error(err);
  }
};

Program.prototype.addFragmentSource = function(fragSrc) {
  this.fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
  this.gl.shaderSource(this.fragShader, kFragmentShaderPrefix + fragSrc + '\n');
  this.gl.compileShader(this.fragShader);
  if (!this.gl.getShaderParameter(this.fragShader, this.gl.COMPILE_STATUS)) {
    var err = this.gl.getShaderInfoLog(this.fragShader);
    console.log(err);
    throw new Error(err);
  }
};

function glConstToString(gl, c) {
  var result = '';
  Object.keys(gl).forEach(function(keyName) {
    if (gl[keyName] == c) result = keyName;
  })
  return result;
}

Program.prototype.link = function() {
  this.gl.attachShader(this.handle, this.vertShader);
  this.gl.attachShader(this.handle, this.fragShader);
  this.gl.linkProgram(this.handle);

  if (!this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS)) {
    throw new Error(this.gl.getProgramInfoLog(this.handle));
  }

  var numUniforms = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_UNIFORMS);

  for (var i=0; i<numUniforms; i++) {
    var info = this.gl.getActiveUniform(this.handle, i);
    if (info.size > 1) {
      for (var j=0; j<info.size; j++) {
        var arrayElementName = info.name.replace(/\[\d+\]/, '[' + j + ']');
        var location = this.gl.getUniformLocation(this.handle, arrayElementName);
        this.uniforms[arrayElementName] = Program.makeUniformSetter(this.gl, info.type, location);
      }
    } else {
      var location = this.gl.getUniformLocation(this.handle, info.name);
      console.log('uniform', info.name, glConstToString(this.gl, info.type));
      this.uniforms[info.name] = Program.makeUniformSetter(this.gl, info.type, location);
    }
  }

  var numAttributes = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_ATTRIBUTES);
  for (var i=0; i<numAttributes; i++) {
    info = this.gl.getActiveAttrib(this.handle, i);
    var location = this.gl.getAttribLocation(this.handle, info.name);
    this.attributes[info.name] = location;
  }
  this.ready = true;
  return this;
};

Program.prototype.bind = function() {
  return this.gl.useProgram(this.handle);
};

Program.prototype.unbind = function() {
  this.gl.useProgram(null);
};

Program.prototype.dispose = function() {
  this.gl.deleteShader(this.vertShader);
  this.gl.deleteShader(this.fragShader);
  return this.gl.deleteProgram(this.handle);
};

Program.makeUniformSetter = function(gl, type, location) {
  var setterFun = null;
  switch (type) {
    case gl.BOOL:
    case gl.INT:
      setterFun = function(value) {
        return gl.uniform1i(location, value);
      };
      break;
    case gl.SAMPLER_2D:
    case gl.SAMPLER_CUBE:
      setterFun = function(value) {
        return gl.uniform1i(location, value);
      };
      break;
    case gl.FLOAT:
      setterFun = function(value) {
        return gl.uniform1f(location, value);
      };
      break;
    case gl.FLOAT_VEC2:
      setterFun = function(v) {
        return gl.uniform2f(location, v[0], v[1]);
      };
      break;
    case gl.FLOAT_VEC3:
      setterFun = function(v) {
        return gl.uniform3f(location, v[0], v[1], v[2]);
      };
      break;
    case gl.FLOAT_VEC4:
      setterFun = function(v) {
        gl.uniform4f(location, v[0], v[1], v[2], v[3]);
      };
      break;
    case gl.FLOAT_MAT3:
      var mv = new Float32Array(9);
      setterFun = function(m) {
        mv[0]  = m[0];
        mv[1]  = m[1];
        mv[2]  = m[2];
        mv[3]  = m[3];
        mv[4]  = m[4];
        mv[5]  = m[5];
        mv[6]  = m[6];
        mv[7]  = m[7];
        mv[8]  = m[8];
        gl.uniformMatrix3fv(location, false, mv);
      };
      break;
    case gl.FLOAT_MAT4:
      var mv = new Float32Array(16);
      setterFun = function(m) {
        mv[0]  = m[0];
        mv[1]  = m[1];
        mv[2]  = m[2];
        mv[3]  = m[3];
        mv[4]  = m[4];
        mv[5]  = m[5];
        mv[6]  = m[6];
        mv[7]  = m[7];
        mv[8]  = m[8];
        mv[9]  = m[9];
        mv[10] = m[10];
        mv[11] = m[11];
        mv[12] = m[12];
        mv[13] = m[13];
        mv[14] = m[14];
        mv[15] = m[15];
        return gl.uniformMatrix4fv(location, false, mv);
      };
      break;
  }
  if (setterFun) {
    setterFun.type = type;
    return setterFun;
  } else {
    return function() {
      throw new Error('Unknown uniform type: ' + type);
    };
  }
};

module.exports = Program;
