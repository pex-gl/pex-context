var unpack = require('../util/unpack-array');

//VBO implementation
//Example usage new Buffer(gl, vertices, { usage: gl.STATIC_DRAW, target: gl.ARRAY_BUFFER, type: Float32Array})
function VertexBuffer(gl, data, opts) {
  this.gl = gl;
  opts = opts || {};
  this.usage = opts.usage || gl.STATIC_DRAW; //DYNAMIC_DRAW
  this.target = opts.target; //ELEMENT_ARRAY_BUFFER
  this.type = opts.type || Float32Array; //Uint16Array, Uint32Array in WebGL2.0?
  this.size = opts.size;
  //FIXME: refactor attrib size guessing code
  if (!this.size && Array.isArray(data) && Array.isArray(data[0])) {
    this.size = data[0].length;
  }
  if (!this.size) {
    throw new Error('Couldn\t guess attribute size');
  }

  if (Array.isArray(data)) {
    //array of arrays -> flat typed array
    if (Array.isArray(data[0])) {
      this.dataBuf = new this.type(data.length * data[0].length);
      unpack(this.dataBuf, data);
    }
    //array -> flat type array
    else {
      this.dataBuf = new this.type(data)
    }
  }
  else {
    //assuming typed array
    this.dataBuf = data;
  }

  this.handle = this.gl.createBuffer();
  this.gl.bindBuffer(this.target, this.handle);
  this.gl.bufferData(this.target, this.dataBuf, this.usage);
  this.gl.bindBuffer(this.target, null);
}

//assuming the same array length
VertexBuffer.prototype.update = function(data) {
  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      unpack(this.dataBuf, data);
    }
    //array -> flat type array
    else {
      this.dataBuf.set(data);
    }
  }
  else {
    this.dataBuf.set(data);
  }
  this.gl.bindBuffer(this.target, this.handle);
  this.gl.bufferData(this.target, this.dataBuf, this.usage);
  this.gl.bindBuffer(this.target, null);
}

VertexBuffer.prototype.dispose = function() {
  this.gl.deleteBuffer(this.handle);
  this.handle = null;
};

module.exports = VertexBuffer;
