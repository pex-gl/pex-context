var pack = require('array-pack-2d');

//VBO implementation
//Example usage new Buffer(gl, vertices, { usage: gl.STATIC_DRAW, target: gl.ARRAY_BUFFER, type: Float32Array})
function Buffer(gl, data, opts) {
  this.gl = gl;
  opts = opts || {};
  this.usage = opts.usage || gl.STATIC_DRAW; //DYNAMIC_DRAW
  this.target = opts.target || gl.ARRAY_BUFFER; //ELEMENT_ARRAY_BUFFER
  this.type = opts.type || Float32Array; //Uint16Array, Uint32Array in WebGL2.0?
  this.size = opts.size || 3; //element size, FIXME: is that good assumption?

  if (Array.isArray(data)) {
    //array of arrays -> flat typed array
    if (Array.isArray(data[0])) {
      data = pack(data, this.type);
    }
    //array -> flat type array
    else {
      data = new this.type(data)
    }
  }

  this.dataBuf = data;
  this.handle = this.gl.createBuffer();
  this.gl.bindBuffer(this.target, this.handle);
  this.gl.bufferData(this.target, this.dataBuf, this.usage);
}

Buffer.prototype.dispose = function() {
  this.gl.deleteBuffer(this.handle);
  this.handle = null;
};

module.exports = Buffer;
