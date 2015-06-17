var Window = require('../sys/Window');
var Vao   = require('./Vao');
var State = require('./State');

//function Attribute(){
//    this.name = '';
//    this.format = -1;
//    this.buffer = null;
//    this.data = null;
//    this.dataDirty = false;
//}

var Context = {
    createVbo : function(){}
};


function BufferAttributeMap(){
    var ctx = Context.get();
    this.buffer = ctx.createVbo(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    this.texture = ctx.createTexture();

    this.buffer = new Vbo(ctx,gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
}

function Gbo(){
    var gl = this._gl = Window.getCurrentContext();

    this._vao = new Vao();
    this._buffers = {};

    this._buffers[gl.ARRAY_BUFFER] = [];
    this._buffers[gl.ELEMENT_ARRAY_BUFFER] = [];
}



Gbo.prototype.addBufferAttributeMap = function(bufferAttributeMap){

}

Gbo.prototype.draw = function(){};



//var Window = require('../sys/Window');
//var Vao = require('./Vao');
//var Vbo = require('./Vbo');
//var Program = require('./Program');
//
//
//function Attribute(){
//    this.name = '';
//    this.format = -1;
//    this.buffer = null;
//    this.data = null;
//    this.dataDirty = false;
//}
//
//function Index(){
//    this.buffer = null;
//    this.data = null;
//    this.dataDirty = false;
//    this.format = null;
//}
//
//function Format(){
//    this.sizeVertex = 3;
//    this.sizeNormal = 3;
//    this.sizeColor  = 4;
//    this.sizeTexcoord = 2;
//    this.formatIndex = null;
//    this.usageVbo = null;
//    this.usageIbo = null;
//}
//
//function Gbo(format){
//    this._gl = Window.getCurrentContext();
//    this._format = format === undefined ? new Format() : format;
//    this._vao = new Vao();
//    this._buffers = {};
//    this._buffersData = {};
//    this._attributes = {};
//    this._tempF32Array = new Float32Array(0);
//}
//
////will copy in shared buffer
//Gbo.prototype.addAttributesMerged = function(names,formats,dataOrSizes,preserveData){};
//
//Gbo.prototype.addAttribute = function(name,sizeOrData,usage,preserveData){
//    var gl = this._gl;
//    var attribute = new Attribute();
//    attribute.name   = name;
//    attribute.buffer = new Vbo(gl.ARRAY_BUFFER,sizeOrData,usage);
//    if(preserveData){
//        attribute.data = new Float32Array(sizeOrData);
//        attribute.dataDirty = true;
//    }
//    this._attributes[name] = attribute;
//    return attribute;
//};
//
//Gbo.prototype.updateAttributeData = function(name){
//    this._attributes[name].dataDirty = true;
//};
//
//Gbo.prototype.addIndices = function(sizeOrData,usage,format,preserveData){
//    var gl = this._gl;
//    var indices = new Index();
//    indices.buffer = new Vbo(gl.ELEMENT_ARRAY_BUFFER,sizeOrData,usage);
//    indices.format = format === undefined ? gl.UNSIGNED_SHORT : format;
//    if(preserveData){
//        indices.data = format == gl.UNSIGNED_SHORT ? new Uint16Array(sizeOrData) : new Uint32Array(sizeOrData);
//        indices.dataDirty = true;
//    }
//    this._indices.push(indices);
//    return indices;
//};
//
//Gbo.prototype.bufferAttributeData = function(name,sizeOrData){
//    this._arrayBuffers[name].bufferData(sizeOrData);
//};
//
//Gbo.prototype.bufferAttributeSubData = function(name,offset,data){
//    this._arrayBuffers[name].bufferSubData(offset,data);
//};
//
//Gbo.prototype.bufferAttributeData2 = function(name,data){
//    var dataLengthUnpacked = data.length * 2;
//    var tempF32Array = this._tempF32Array = this._tempF32Array >= dataLengthUnpacked ? this._tempF32Array : new Float32Array(dataLengthUnpacked);
//    for(var i = 0, l = data.length, j = 0; i < l; ++i, j+=2){
//        tempF32Array[j  ] = data[i];
//        tempF32Array[j+1] = data[i];
//    }
//    var attribute = this._attributes[name];
//    attribute.buffer.bufferData(tempF32Array);
//    if(attribute.data){
//        attribute.data = attribute.data.length == dataLengthUnpacked ? attribute.data : new Float32Array(dataLengthUnpacked);
//        attribute.data.set(tempF32Array);
//        attribute.dataDirty = true;
//    }
//};
//
//Gbo.prototype.bufferAttributeData3 = function(name,data){
//    var dataLengthUnpacked = data.length * 3;
//    var tempF32Array = this._tempF32Array = this._tempF32Array >= dataLengthUnpacked ? this._tempF32Array : new Float32Array(dataLengthUnpacked);
//    for(var i = 0, l = data.length, j = 0; i < l; ++i, j+=3){
//        tempF32Array[j  ] = data[i];
//        tempF32Array[j+1] = data[i];
//        tempF32Array[j+2] = data[i];
//    }
//    var attribute = this._attributes[name];
//    attribute.buffer.bufferData(tempF32Array);
//    if(attribute.data){
//        attribute.data = attribute.data.length == dataLengthUnpacked ? attribute.data : new Float32Array(dataLengthUnpacked);
//        attribute.data.set(tempF32Array);
//        attribute.dataDirty = true;
//    }
//};
//Gbo.prototype.bufferAttributeData4 = function(name,data){
//    var dataLengthUnpacked = data.length * 4;
//    var tempF32Array = this._tempF32Array = this._tempF32Array >= dataLengthUnpacked ? this._tempF32Array : new Float32Array(dataLengthUnpacked);
//    for(var i = 0, l = data.length, j = 0; i < l; ++i, j+=4){
//        tempF32Array[j  ] = data[i];
//        tempF32Array[j+1] = data[i];
//        tempF32Array[j+2] = data[i];
//        tempF32Array[j+3] = data[i];
//    }
//    var attribute = this._attributes[name];
//    attribute.buffer.bufferData(tempF32Array);
//    if(attribute.data){
//        attribute.data = attribute.data.length == dataLengthUnpacked ? attribute.data : new Float32Array(dataLengthUnpacked);
//        attribute.data.set(tempF32Array);
//        attribute.dataDirty = true;
//    }
//};
//
//Gbo.prototype.bufferIndicesData = function(data){};
//Gbo.prototype.bufferIndicesSubData = function(data,offset){};
//Gbo.prototype.bufferIndicesDataAtIndex = function(data,index){};
//Gbo.prototype.bufferIndicesSubDataAtIndex = function(data,offset,index){};
//
//Gbo.prototype.getAttributes = function(){};
//Gbo.prototype.getIndices = function(){};
//
//Gbo.prototype.getAttribute = function(name){};
//Gbo.prototype.getIndicesAtIndex = function(index){};
//
//
//Gbo.prototype.getFormat = function(){
//
//};
//
//Gbo.prototype.draw = function(){
//    var gl = this._gl;
//    var glid = gl.id;
//    var program = Program.__getStack()[glid].peek();
//
//    //so if this all would be centralised we could
//
//};
//
