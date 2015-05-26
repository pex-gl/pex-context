var geom = require('pex-geom');
var Vec2 = geom.Vec2;
var Vec3 = geom.Vec3;
var Vec4 = geom.Vec4;

var Color = require('pex-color').Color;

var Context = require('./Context');

function hasProperties(obj, list) {
  for (var i=0; i < list.length; i++) {
    var prop = list[i];
    if (typeof obj[prop] === 'undefined') {
      return false;
    }
  }
  return true;
};

function Buffer(target, type, data, usage) {
  this.gl = Context.currentContext;
  this.target = target;
  this.type = type;
  this.usage = usage || gl.STATIC_DRAW;
  this.dataBuf = null;
  if (data) {
    this.update(data, this.usage);
  }
}

Buffer.prototype.dispose = function() {
  this.gl.deleteBuffer(this.handle);
  this.handle = null;
};

Buffer.prototype.update = function(data, usage) {
  if (!this.handle) {
    this.handle = this.gl.createBuffer();
  }
  this.usage = usage || this.usage;
  if (!data || data.length === 0) {
    return;
  }
  if (!isNaN(data[0])) {
    if (!this.dataBuf || this.dataBuf.length !== data.length) {
      this.dataBuf = new this.type(data.length);
    }
    for (var i=0; i<data.length; i++) {
      v = data[i];
      this.dataBuf[i] = v;
      this.elementSize = 1;
    }
  }
  else if (hasProperties(data[0], ['x', 'y', 'z', 'w'])) {
    if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
      this.dataBuf = new this.type(data.length * 4);
      this.elementSize = 4;
    }
    for (var i=0; i<data.length; i++) {
      v = data[i];
      this.dataBuf[i * 4 + 0] = v.x;
      this.dataBuf[i * 4 + 1] = v.y;
      this.dataBuf[i * 4 + 2] = v.z;
      this.dataBuf[i * 4 + 3] = v.w;
    }
  }
  else if (hasProperties(data[0], ['x', 'y', 'z'])) {
    if (!this.dataBuf || this.dataBuf.length !== data.length * 3) {
      this.dataBuf = new this.type(data.length * 3);
      this.elementSize = 3;
    }
    for (var i=0; i<data.length; i++) {
      v = data[i];
      this.dataBuf[i * 3 + 0] = v.x;
      this.dataBuf[i * 3 + 1] = v.y;
      this.dataBuf[i * 3 + 2] = v.z;
    }
  }
  else if (hasProperties(data[0], ['x', 'y'])) {
    if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
      this.dataBuf = new this.type(data.length * 2);
      this.elementSize = 2;
    }
    for (var i=0; i<data.length; i++) {
      v = data[i];
      this.dataBuf[i * 2 + 0] = v.x;
      this.dataBuf[i * 2 + 1] = v.y;
    }
  }
  else if (hasProperties(data[0], ['r', 'g', 'b', 'a'])) {
    if (!this.dataBuf || this.dataBuf.length !== data.length * 4) {
      this.dataBuf = new this.type(data.length * 4);
      this.elementSize = 4;
    }
    for (var i=0; i<data.length; i++) {
      v = data[i];
      this.dataBuf[i * 4 + 0] = v.r;
      this.dataBuf[i * 4 + 1] = v.g;
      this.dataBuf[i * 4 + 2] = v.b;
      this.dataBuf[i * 4 + 3] = v.a;
    }
  }
  else if (data[0].length === 2) {
    if (!this.dataBuf || this.dataBuf.length !== data.length * 2) {
      this.dataBuf = new this.type(data.length * 2);
      this.elementSize = 1;
    }
    for (var i=0; i<data.length; i++) {
      e = data[i];
      this.dataBuf[i * 2 + 0] = e[0];
      this.dataBuf[i * 2 + 1] = e[1];
    }
  }
  else if (data[0].length >= 3) {
    var numIndices = 0;
    for (var i=0; i<data.length; i++) {
      var face = data[i];
      if (face.length === 3) {
        numIndices += 3;
      }
      if (face.length === 4) {
        numIndices += 6;
      }
      if (face.length > 4) {
        throw new Error('Face polygons ' + face.length + ' "' + face + '" + are not supported in RenderableGeometry Buffers');
      }
    }
    if (!this.dataBuf || this.dataBuf.length !== numIndices) {
      this.dataBuf = new this.type(numIndices);
      this.elementSize = 1;
    }
    var index = 0;
    for (var i=0; i<data.length; i++) {
      var face = data[i];
      if (face.length === 3) {
        this.dataBuf[index + 0] = face[0];
        this.dataBuf[index + 1] = face[1];
        this.dataBuf[index + 2] = face[2];
        index += 3;
      }
      if (face.length === 4) {
        this.dataBuf[index + 0] = face[0];
        this.dataBuf[index + 1] = face[1];
        this.dataBuf[index + 2] = face[3];
        this.dataBuf[index + 3] = face[3];
        this.dataBuf[index + 4] = face[1];
        this.dataBuf[index + 5] = face[2];
        index += 6;
      }
    }
  }
  else {
    console.log('Buffer.unknown type', data.name, data[0]);
  }
  this.gl.bindBuffer(this.target, this.handle);
  this.gl.bufferData(this.target, this.dataBuf, this.usage);
};

module.exports = Buffer;
