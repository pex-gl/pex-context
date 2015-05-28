//VertexBuffer implementation
//Example usage new VertexBuffer(gl, vertices, { usage: gl.STATIC_DRAW, target: gl.ARRAY_BUFFER, type: Float32Array})
function VertexBuffer(gl, data, opts) {
  this.gl = gl;
  opts = opts || {};
  this.usage = opts.usage || gl.STATIC_DRAW; //DYNAMIC_DRAW
  this.target = opts.target || gl.ARRAY_BUFFER; //ELEMENT_ARRAY_BUFFER
  this.type = opts.type || Float32Array; //Uint16Array, Uint32Array in WebGL2.0?
  this.size = opts.size || 3; //element size, FIXME: is that good assumption?

  this.dataBuf = Array.isArray(data) ? new this.type(data) : data;
  this.handle = this.gl.createBuffer();
  this.gl.bindBuffer(this.target, this.handle);
  this.gl.bufferData(this.target, this.dataBuf, this.usage);
}

VertexBuffer.prototype.dispose = function() {
  this.gl.deleteBuffer(this.handle);
  this.handle = null;
};

module.exports = VertexBuffer;
