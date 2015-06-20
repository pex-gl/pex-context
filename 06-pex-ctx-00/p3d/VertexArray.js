var DEFAULT_VERTEX_ATTRIB = {
    enabled    : true,
    location   : -1,
    size       : -1,
    type       : null,
    normalized : false,
    stride     : 0,
    offset     : 0,
    divisor    : null,

    prevEnabled : false
};

var STR_ERROR_ATTRIB_PROPERTY_MISSING   = 'Attribute property "%s" missing.';
var STR_ERROR_ATTRIB_PROPERTY_NOT_VALID = 'Attribute property "%s" not valid.';
var STR_ERROR_ATTRIB_LOCATION_DUPLICATE = 'Attribute at location "%s" has already been defined.';

/**
 * @example
 * //init with interleaved buffer and index buffer
 * var vertexArray = new VertexArray(ctx,[
 *     {buffer : buffer0, location : ctx.ATTRIB_POSITION, size : 3, stride : 0, offset : 0 },
 *     {buffer : buffer0, location : ctx.ATTRIB_NORMAL, size : 3, stride : 0, offset : 4 * 3 * 4},
 *     {buffer : buffer1, location : ctx.ATTRIB_COLOR, size : 4},
 * ], indexBuffer);
 *
 *
 * @param {Context} ctx
 * @param {Array} attributes
 * @param {Buffer} [indexBuffer]
 * @constructor
 */

function VertexArray(ctx,attributes,indexBuffer){
    this._ctx = ctx;

    this._attributes   = {};
    this._arrayBuffers = [];
    this._indexBuffer  = indexBuffer !== undefined ? indexBuffer : null;
    //we have no separated divisors,but we need to know if VertexArray has divisors for setting
    //the draw func on ctx.bindVertexArray to remove rechecking on draw
    this._hasDivisor   = false;

    var attrib, attribCopy, defaultProp, buffer;
    var bufferIndex;

    for(var i = 0, l = attributes.length; i < l; ++i){
        attrib = attributes[i];

        if(attrib['location'] === undefined){
            throw new Error(STR_ERROR_ATTRIB_PROPERTY_MISSING.replace('%s','location'));
        }
        if(attrib['size'] === undefined){
            throw new Error(STR_ERROR_ATTRIB_PROPERTY_MISSING.replace('%s','size'));
        }
        if(attrib['buffer'] === undefined){
            throw new Error(STR_ERROR_ATTRIB_PROPERTY_MISSING.replace('%s','buffer'));
        }

        //Check if all passed parameters are valid (e.g. no typos)
        attribCopy = {};
        for(var property in attrib){
            defaultProp = DEFAULT_VERTEX_ATTRIB[property];
            if(defaultProp === undefined && property !== 'buffer'){
                throw new Error(STR_ERROR_ATTRIB_PROPERTY_NOT_VALID.replace('%s',property));
            }
            attribCopy[property] = attrib[property];
        }

        //Check if location for that attribute is not taken already
        if(this._attributes[attribCopy.location] !== undefined){
            throw new Error(STR_ERROR_ATTRIB_LOCATION_DUPLICATE.replace('%s',attrib.location));
        }

        buffer      = attribCopy.buffer;
        bufferIndex = this._arrayBuffers.indexOf(buffer);
        if(bufferIndex == -1){
            this._arrayBuffers.push(buffer);
            bufferIndex = this._arrayBuffers.length - 1;
            this._attributes[bufferIndex] = [];
        }

        attribCopy.type = buffer.getDataType();
        delete attribCopy.buffer;

        this._hasDivisor = this._hasDivisor || attribCopy.divisor !== null;
        this._attributes[bufferIndex].push(attribCopy);
    }
}

/**
 * Returns true if vertex array has an ctx.ELEMENT_BUFFER bound
 * @returns {boolean}
 */

VertexArray.prototype.hasIndexBuffer = function(){
    return this._indexBuffer !== null;
};

VertexArray.prototype.getIndexBuffer = function(){
    return this._indexBuffer;
};

VertexArray.prototype.hasDivisor = function(){
    return this._hasDivisor;
};

VertexArray.prototype._bindInternal = function(){
    var ctx = this._ctx;
    var gl  = ctx.getGL();

    var prevVertexArray    = ctx.getVertexArray();
    var vertexArrayDiffers = prevVertexArray == this;

    var arrayBuffers = this._arrayBuffers;
    var attributes   = this._attributes;

    var bufferAttributes, attribute, location;

    for(var i = 0, l = arrayBuffers.length, j, k; i < l; ++i){
        arrayBuffers[i]._bindInternal();
        bufferAttributes = attributes[i];

        for(j = 0, k = bufferAttributes.length; j < k; ++j){
            attribute = bufferAttributes[i];
            location  = attribute.location;

            if(!attribute.enabled && (attribute.prevEnabled || vertexArrayDiffers)){
                gl.disableVertexAttribArray(location);
                attribute.enabled = attribute.prevEnabled = false;
                continue;
            }

            if(!attribute.prevEnabled || vertexArrayDiffers){
                gl.enableVertexAttribArray(location);
                attribute.prevEnabled = true;
            }

            if(vertexArrayDiffers){
                gl.vertexAttribPointer(
                    location,
                    attribute.size,
                    attribute.format,
                    attribute.normalized,
                    attribute.stride,
                    attribute.offset
                )
            }

            if(attribute.divisor === null || !vertexArrayDiffers){
                continue;
            }

            gl.vertexAttribDivisor(location,attribute.divisor);
        }
    }

    if(this._indexBuffer !== null){
        this._indexBuffer._bindInternal();
    }
};

module.exports = VertexArray;
