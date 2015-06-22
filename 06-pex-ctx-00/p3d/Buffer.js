function Buffer(ctx, target, sizeOrData, usage, preserveData) {
    var gl = ctx.getGL();

    this._ctx          = ctx;
    this._target       = target === undefined ? gl.ARRAY_BUFFER : target;
    this._usage        = usage  === undefined ? gl.STATIC_DRAW  : usage;
    this._length       = 0;
    this._byteLength   = 0;
    this._dataType     = null;
    this._preserveData = preserveData === undefined ? false : preserveData;
    this._handle       = gl.createBuffer();

    if(sizeOrData !== undefined && sizeOrData != 0){
        this.bufferData(sizeOrData);
    }
}

Buffer.prototype._getHandle = function(){
    return this._handle;
};

Buffer.prototype.setTarget = function(target){
    this._target = target;
};

Buffer.prototype.getTarget = function(){
    return this._target;
};

Buffer.prototype.setUsage = function(usage){
    this._usage = usage;
};

Buffer.prototype.getUsage = function(){
    return this._usage;
};

Buffer.prototype.getLength = function(){
    return this._length;
};

Buffer.prototype.getByteLength = function(){
    return this._byteLength;
};

Buffer.prototype.getDataType = function(){
    return this._dataType;
};

Buffer.prototype.getData = function(){
    return this._data;
};

Buffer.prototype.bufferData = function(sizeOrData){
    var ctx = this._ctx;
    var gl  = ctx.getGL();

    ctx._bindBuffer(this);

    if(sizeOrData === undefined){
        if(this._data !== null){
            gl.bufferData(this._target,this._data,this._usage);
            ctx._unbindBuffer(this);
            return;
        } else {
            throw new Error('No size or data passed. Or no preserved data set.');
        }
    }

    if(sizeOrData.byteLength !== undefined){
        this._length     = sizeOrData.length;
        this._byteLength = sizeOrData.byteLength;
        var data_ctor    = sizeOrData.constructor;

        switch(data_ctor){
            case Float32Array:
                this._dataType = gl.FLOAT;
                break;
            case Uint16Array:
                this._dataType = gl.UNSIGNED_SHORT;
                break;
            case Uint32Array:
                this._dataType = gl.UNSIGNED_INT;
                break;
            default:
                throw new TypeError('Unsupported data type.');
                break;
        }

        if(this._preserveData){
            this._data = new data_ctor(sizeOrData);
        }

    } else {
        this._length     = sizeOrData;
        this._byteLength = null;
        this._dataType   = null;
        this._data       = null;
    }
    gl.bufferData(this._target,sizeOrData,this._usage);

    ctx._unbindBuffer(this);
};

Buffer.prototype.bufferSubData = function(offset,data){
    this._gl.bufferSubData(this._target,offset,data);
};

Buffer.prototype.dispose = function(){
    if(!this._handle){
        throw new Error('Buffer already disposed.');
    }
    this._gl.deleteBuffer(this._handle);
    this._handle = null;
    this._data = null;
};

module.exports = Buffer;
