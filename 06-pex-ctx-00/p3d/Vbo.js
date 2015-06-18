function Vbo(ctx, target, sizeOrData, usage, preserveData) {
    this._gl           = ctx.getGL();
    this._target       = target === undefined ? gl.ARRAY_BUFFER : target;
    this._usage        = usage  === undefined ? gl.STATIC_DRAW  : usage;
    this._length       = 0;
    this._byteLength   = 0;
    this._dataType     = null;
    this._dataFormat   = null;
    this._preserveData = preserveData === undefined ? false : preserveData;
    this._handle       = gl.createBuffer();

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

Vbo.prototype.getData = function(){
    return this._data;
};

Vbo.prototype._bindInternal = function(){
    this._gl.bindBuffer(this._target,this._handle);
};

Vbo.prototype.bufferData = function(sizeOrData){
    this._bindInternal();

    var gl = this._gl;
    if(sizeOrData === undefined){
        if(this._data !== null){
            gl.bufferData(this._target,this._data,this._usage);
            return;
        } else {
            throw new Error('No size or data passed. Or no preserved data set.');
        }
    }
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

        if(this._preserveData){
            this._data = sizeOrData.constructor(sizeOrData);
        }

    } else {
        this._length     = sizeOrData;
        this._byteLength = null;
        this._dataType   = null;
        this._dataFormat = null;
        this._data       = null;
    }
    gl.bufferData(this._target,sizeOrData,this._usage);
};

Vbo.prototype.bufferSubData = function(offset,data){
    this._gl.bufferSubData(this._target,offset,data);
};

Vbo.prototype.dispose = function(){
    if(!this._handle){
        throw new Error('Vbo already disposed.');
    }
    this._gl.deleteBuffer(this._handle);
    this._handle = null;
    this._data = null;
};

module.exports = Vbo;

