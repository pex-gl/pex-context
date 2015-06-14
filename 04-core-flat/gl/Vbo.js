var Window = require('../sys/Window');
var Id     = require('../sys/Id');
var Stack  = require('./Stack');
var Vao    = require('./Vao');

var stack = {};

function Vbo(target,sizeOrData,usage){
    var gl = Window.getCurrentContext();
    stack[gl.id] = stack[gl.id] === undefined ? new Stack() : stack[gl.id];

    this._gl         = gl;
    this._target     = target === undefined ? gl.ARRAY_BUFFER : target;
    this._usage      = usage  === undefined ? gl.STATIC_DRAW  : usage;
    this._length     = 0;
    this._byteLength = 0;
    this._dataType   = null;
    this._dataFormat = null;
    this._handle     = gl.createBuffer();
    this._id         = Id.get();

    if(sizeOrData !== undefined && sizeOrData != 0){
        this.bind();
        this.bufferData(sizeOrData);
        this.unbind();
    }
}

Vbo.prototype.setTarget = function(target){
    this._target = target;
};

Vbo.prototype.getTarget = function(){
    return this._target;
};

Vbo.prototype.setUsage = function(usage){
    this._usage = usage;
};

Vbo.prototype.getUsage = function(){
    return this._usage;
};

Vbo.prototype.getLength = function(){
    return this._length;
};

Vbo.prototype.getByteLength = function(){
    return this._byteLength;
};

Vbo.prototype.getDataType = function(){
    return this._dataType;
};

Vbo.prototype.getDataFormat = function(){
    return this._dataFormat;
};

Vbo.prototype.getId = function(){
    return this._id;
};

Vbo.prototype.dispose = function(){
    if(!this._handle){
        return;
    }
    this._gl.deleteBuffer(this._handle);
    this._handle = null;
};

Vbo.prototype._bindInternal = function(){
    this._gl.bindBuffer(this._target,this._handle);
};

Vbo.prototype.bind = function(){
    var glid = this._gl.id;
    var stack_ = stack[glid];
    var vao = Vao.__getStack()[glid];

    //associate vao.vertexAttrib... with buffer
    if(vao !== undefined && !vao.isEmpty()){
        vao.peek()._bindBuffer(this);
    }

    if(stack_.peek() == this){
        return;
    }

    this._bindInternal();
    stack_.push(this);
};

Vbo.prototype.unbind = function(){
    var glid = this._gl.id;
    var stack_ = stack[glid];
    var vao = Vao.__getStack()[glid];

    if(stack_.peek() != this){
        throw new Error('Vbo previously not bound.');
    }

    if(vao !== undefined && !vao.isEmpty()){
        vao.peek()._unbindBuffer(this);
    }

    stack_.pop();
    if(stack_.isEmpty()){
        this._gl.bindBuffer(this._target,null);
        return;
    }
    var prev = stack_.peek();
    if(prev == this){
        return;
    }

    prev._bindInternal();
};

Vbo.prototype.bufferData = function(sizeOrData){
    var gl = this._gl;
    if(sizeOrData.byteLength !== undefined){
        this._length     = sizeOrData.length;
        this._byteLength = sizeOrData.byteLength;
        this._dataType   = sizeOrData.constructor;

        switch(this._dataType){
            case Float32Array:
                this._dataFormat = gl.FLOAT;
                break;
            case Uint16Array:
                this._dataFormat = gl.UNSIGNED_SHORT;
                break;
            case Uint32Array:
                this._dataFormat = gl.UNSIGNED_INT;
                break;
            default:
                throw new TypeError('Unsupported data type.');
                break;
        }
    } else {
        this._length     = sizeOrData;
        this._byteLength = null;
        this._dataType   = null;
        this._dataFormat = null;
    }
    gl.bufferData(this._target,sizeOrData,this._usage);
};

Vbo.prototype.bufferSubData = function(offset,data){
    this._gl.bufferSubData(this._target,offset,data);
};

Vbo.__getStack = function(){
    return stack;
};

module.exports = Vbo;