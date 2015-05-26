var Geometry = require('pex-geom').Geometry;
var Context = require('./Context');
var Buffer = require('./Buffer');

var indexTypes = ['faces', 'edges', 'indices'];

var RenderableGeometry = {
  compile: function() {
    if (this.gl == null) {
      this.gl = Context.currentContext;
    }
    for (var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      if (!attrib.buffer) {
        var usage = attrib.dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
        attrib.buffer = new Buffer(this.gl.ARRAY_BUFFER, Float32Array, null, usage);
        attrib.dirty = true;
      }
      if (attrib.dirty) {
        attrib.buffer.update(attrib);
        attrib.dirty = false;
      }
    }
    for (var i=0; i<indexTypes.length; i++) {
      var indexName = indexTypes[i];
      if (this[indexName]) {
        if (!this[indexName].buffer) {
          var usage = this[indexName].dynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
          this[indexName].buffer = new Buffer(this.gl.ELEMENT_ARRAY_BUFFER, Uint16Array, null, usage);
          this[indexName].dirty = true;
        }
        if (this[indexName].dirty) {
          this[indexName].buffer.update(this[indexName]);
          this[indexName].dirty = false
        }
      }
    }
  },
  dispose: function() {
    for (var attribName in this.attribs) {
      var attrib = this.attribs[attribName];
      if (attrib && attrib.buffer) {
        attrib.buffer.dispose();
      }
    }
    for (var i=0; i<indexTypes.length; i++) {
      var indexName = indexTypes[i];
      if (this[indexName] && this[indexName].buffer) {
        this[indexName].buffer.dispose();
      }
    }
  }
};

module.exports = RenderableGeometry;
