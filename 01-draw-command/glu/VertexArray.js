//VBO & VAO implementation
var VertexBuffer = require('./VertexBuffer');

function VertexArray(gl) {
  this.gl = gl;
  this.indexBuffer = null;
  this.attributes = {};
}

VertexArray.prototype.addAttribute = function(name, data, opts) {
  opts = opts || {};
  this.attributes[name] = new VertexBuffer(this.gl, data, opts);
  return this;
}

VertexArray.prototype.updateAttribute = function(name, data) {
  this.attributes[name].update(data);
}

VertexArray.prototype.addIndexBuffer = function(data, opts) {
  opts = opts || {};
  opts.type = Uint16Array;
  this.indexBuffer = new VertexBuffer(this.gl, data, opts);
  return this;
}

VertexArray.prototype.bind = function(program) {
  var gl = this.gl;

  for(var attributeName in this.attributes) {
    var attribute = this.attributes[attributeName];
    if (program.attributes[attributeName] !== undefined) {
      gl.bindBuffer(gl.ARRAY_BUFFER, attribute.handle);
      //TODO: check if program has attribute
      gl.vertexAttribPointer(program.attributes[attributeName], attribute.size, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(program.attributes[attributeName]);
    }
  }

  if (this.indexBuffer) {
    this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.handle);
  }
  else {
    this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

VertexArray.prototype.unbind = function(program) {
  var gl = this.gl;
  gl.disableVertexAttribArray(program.attributes.position);
  if (this.indexBuffer) {
    this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
}

VertexArray.prototype.draw = function(opts) {
  var gl = this.gl;
  var primitiveType = (opts && opts.primitiveType) || gl.TRIANGLES;
  var num = this.attributes.position.dataBuf.length / 2; //FIXME: hardcoded
  //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.faces.buffer.handle);

  if (this.indexBuffer) {
    this.gl.drawElements(primitiveType, this.indexBuffer.dataBuf.length, this.gl.UNSIGNED_SHORT, 0);
  }
  else {
    gl.drawArrays(primitiveType, 0, num);
  }
}

module.exports = VertexArray;
