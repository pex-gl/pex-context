var Buffer = require('./Buffer');

function Mesh(gl) {
  this.gl = gl;
  this.attributes = {};
}

Mesh.prototype.addAttribute = function(name, data, opts) {
  opts = opts || {};
  this.attributes[name] = new Buffer(this.gl, data, opts);
}

Mesh.prototype.bind = function(program) {
  var gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, this.attributes.position.handle); //FIXME: hardcoded
  //index, size, type, normalized, stride, offset
  gl.vertexAttribPointer(program.attributes.position, this.attributes.position.size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.attributes.position);
}

Mesh.prototype.unbind = function(program) {
  var gl = this.gl;
  gl.disableVertexAttribArray(program.attributes.position);
}

Mesh.prototype.draw = function(opts) {
  var gl = this.gl;
  var primitiveType = (opts && opts.primitiveType) || gl.TRIANGLES;
  var num = this.attributes.position.dataBuf.length / 2; //FIXME: hardcoded
  //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);

  gl.drawArrays(primitiveType, 0, num);
}

module.exports = Mesh;
