function Buffer(ctx, target, sizeOrData, usage, preserveData) {
    var gl             = ctx.getGL();
    this._gl           = gl;
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

//FIXME: _bindInternal is tricky as it can modifie Context state if we have VAO active
//TODO: move Buffer._bindInternal to Context
Buffer.prototype._bindInternal = function(){
    this._gl.bindBuffer(this._target,this._handle);
};

Buffer.prototype.bufferData = function(sizeOrData){
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

    //FIXME: Buffer.unbind(); should through Context
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
