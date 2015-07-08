/**
 * @example
 * //Create static buffer
 * var buffer = new Buffer(ctx,
 *     ctx.ARRAY_BUFFER,
 *     new Float32Array([
 *         1,1,1,1
 *     ]),ctx.STATIC_DRAW
 * );
 *
 * @example
 * //Create dynamic buffer with preserved data
 * var buffer = new Buffer(ctx,
 *     ctx.ARRAY_BUFFER,
 *     new Float32Array([
 *         1,1,1,1
 *     ]),ctx.DYNAMIC_DRAW,
 *     true
 * );
 *
 * @example
 * //Create index buffer
 * var buffer = new Buffer(ctx,
 *     ctx.ELEMENT_ARRAY_BUFFER,
 *     new Uint8Array([
 *         0,1,2
 *         3,2,1
 *     ]), ctx.STATIC_DRAW
 * );
 *
 * @param {Context} ctx
 * @param {Number} target - The target buffer object
 * @param {Number| Uint8Array|Uint16Array|Uint32Array|Float32Array} sizeOrData - The size in bytes of the buffers new data store OR the data that will be copied into the data store fore initialization
 * @param {Number} [usage] - The usage pattern of the data store
 * @param {Boolean} [preserveData] - If true the buffered data will be preserved locally for fast access and rebuffering
 * @constructor
 */
function Buffer(ctx, target, sizeOrData, usage, preserveData) {
    var gl = ctx.getGL();

    this._ctx          = ctx;
    this._target       = target === undefined ? gl.ARRAY_BUFFER : target;
    this._usage        = usage  === undefined ? gl.STATIC_DRAW  : usage;
    this._length       = 0;
    this._byteLength   = 0;
    this._data         = null;
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

/**
 * Sets the target buffer object.
 * @param {Number} target
 */
Buffer.prototype.setTarget = function(target){
    this._target = target;
};

/**
 * Returns the target buffer object.
 * @returns {Number}
 */
Buffer.prototype.getTarget = function(){
    return this._target;
};

/**
 * Sets the usage pattern of the data store.
 * @param {Number} usage
 */
Buffer.prototype.setUsage = function(usage){
    this._usage = usage;
};

/**
 * Returns the usage pattern of the data store set.
 * @returns {Number}
 */
Buffer.prototype.getUsage = function(){
    return this._usage;
};

/**
 * Returns the length of the data.
 * @returns {Number}
 */
Buffer.prototype.getLength = function(){
    return this._length;
};

/**
 * Returns the byte length of the data.
 * @returns {null|Number}
 */
Buffer.prototype.getByteLength = function(){
    return this._byteLength;
};

/**
 * Returns the type of tha data stored.
 * @returns {Number}
 */
Buffer.prototype.getDataType = function(){
    return this._dataType;
};

/**
 * Returns the data send to the buffer. (Returns null if preserveData is set to false on creation)
 * @returns {null|Uint8Array|Uint16Array|Uint32Array|Float32Array}
 */
Buffer.prototype.getData = function(){
    return this._data;
};

/**
 * Allocates a size or copies data into the data store.
 * @param {Number|Uint8Array|Uint16Array|Uint32Array|Float32Array} [sizeOrData]
 */
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

/**
 * Redefines some or all of the data store.
 * @param {Number} offset - The offset into the buffers data store where the data replacement will begin, measure in bytes
 * @param {Uint8Array|Uint16Array|Uint32Array|Float32Array} data - The new data that will be copied into the data store
 */
Buffer.prototype.bufferSubData = function(offset,data){
    this._ctx.getGL().bufferSubData(this._target,offset,data);
};

/**
 * Disposes the buffer and removes its content.
 */
Buffer.prototype.dispose = function(){
    if(!this._handle){
        throw new Error('Buffer already disposed.');
    }
    this._gl.deleteBuffer(this._handle);
    this._handle = null;
    this._data = null;
};

module.exports = Buffer;
