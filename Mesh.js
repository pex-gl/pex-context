function unpack(src, out, elemSize) {
    for(var i=0, len=src.length; i<len; i++) {
        for(var j=0; j<elemSize; j++) {
            out[i * elemSize + j] = src[i][j];
        }
    }
}

function isFlatArray(a) {
    return (a.length == 0) || (a[0].length === undefined);
}

//TODO: add divisor support for attributes
/**
 * [Mesh description]
 * @param {[type]} ctx              Context
 * @param {[type]} attributes       Array of { data: Array(flat or list of verts), location: Int, size: Int or guess, usage: Int or guess}
 * @param {[type]} indicesInfo      { data : Array(flat or list faces), usage: Int or guess }
 * @param {[type]} primitiveType    PrimitiveType (default guesses from indices: no indices = POINTS, list of edges = LINES, list of faces = TRIANGLES)
 */
function Mesh(ctx, attributes, indicesInfo, primitiveType) {
    this._ctx = ctx;

    var attributesDesc = [];

    this._attributes = [];
    this._attributesMap = [];


    var vertexCount = 0;

    for(var i=0, len=attributes.length; i<len; i++) {
        var attributeInfo = attributes[i];
        var data = attributeInfo.data;
        var location = attributeInfo.location;
        var elementSize = attributeInfo.size || (data[0] && data[0].length) ? data[0].length : 1;
        //TODO: this can be done with !isNaN(data[0])

        //TODO: are we allowing empty attributes e.g. data=[] ?
        if (!data.length) {
            throw new Error('Mesh: Empty attribute data is not supported');
        }

        if (location === undefined) {
            throw new Error('Mesh: Unknown attribute location at index ' + i);
        }

        var dataArray = new Float32Array(data.length * elementSize);
        if (isFlatArray(data)) {
            dataArray.set(data);
        }
        else {
            unpack(data, dataArray, elementSize);
        }

        var usage = attributeInfo.usage || ctx.STATIC_DRAW;

        var buffer = ctx.createBuffer(ctx.ARRAY_BUFFER, dataArray, usage);

        var attributeDesc = {
            buffer: buffer,
            location : location,
            size: attributeInfo.size || elementSize
        }

        var attribute = {
            data: data,
            dataArray: dataArray,
            buffer: buffer,
            location : location,
            size: attributeInfo.size || elementSize
        }

        attributesDesc.push(attributeDesc);
        this._attributes.push(attribute);
        this._attributesMap[location] = attribute;

        if (location == ctx.ATTRIB_POSITION) {
            vertexCount = data.length;
        }
    }

    var indicesCount = 0;

    if (indicesInfo) {
        var indicesData = indicesInfo.data;
        var indicesDataElementSize = indicesInfo.size || ((indicesData[0] && indicesData[0].length) ? indicesData[0].length : 1);
        var indicesDataType = indicesInfo.type;
        if (!indicesDataType) {
            if (ctx.isSupported(ctx.CAPS_ELEMENT_INDEX_UINT)) {
                indicesDataType = ctx.UNSIGNED_INT;
            }
            else {
                indicesDataType = ctx.UNSIGNED_SHORT;
            }
        }
        var indicesDataArrayType = (indicesDataType === ctx.UNSIGNED_INT) ? Uint32Array : Uint16Array;
        var indicesDataArray = new indicesDataArrayType(indicesData.length * indicesDataElementSize);

        if (isFlatArray(indicesData)) {
            indicesDataArray.set(indicesData);
        }
        else {
            unpack(indicesData, indicesDataArray, indicesDataElementSize)
        }

        var usage = indicesInfo.usage || ctx.STATIC_DRAW;

        var indicesBuffer  = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indicesDataArray, usage);

        if (!primitiveType) {
            if (indicesDataElementSize == 1) primitiveType = ctx.POINTS;
            if (indicesDataElementSize == 2) primitiveType = ctx.LINES;
            if (indicesDataElementSize == 3) primitiveType = ctx.TRIANGLES;
        }

        this._indices = {
            data: indicesData,
            dataArray: indicesDataArray,
            buffer: indicesBuffer,
            size: indicesDataElementSize
        };

        indicesCount = indicesData.length * indicesDataElementSize;
    }
    else {
        this._indices = null;
    }

    this._primiviteType = primitiveType || ctx.TRIANGLES;
    this._count = indicesCount || vertexCount;
    this._offset = 0;
    this._vao = ctx.createVertexArray(attributesDesc, this._indices ? this._indices.buffer : null);
}

Mesh.prototype.draw = function() {
    this._ctx.bindVertexArray(this._vao);
    this._ctx.drawElements(this._primiviteType, this._count, this._offset);
}

Mesh.prototype.getAttribute = function(location) {
    return this._attributesMap[location];
}

Mesh.prototype.updateAttribute = function(location, data) {
    var ctx = this._ctx;
    var attribute = this._attributesMap[location];

    if (!attribute) {
        throw new Error('Mesh.updateAttribute: invalid attribute loaction');
    }

    if (data.length * attribute.size != attribute.dataArray.length) {
        attribute.dataArray = new Float32Array(data.length * attribute.size);
    }

    if (isFlatArray(data)) {
        attribute.dataArray.set(data);
    }
    else {
        //ASSUMING we don't suddently change Vec2 into Vec3, so size is the same
        unpack(data, attribute.dataArray, attribute.size);
    }

    attribute.data = data;

    //TODO: test this
    if (location == ctx.ATTRIB_POSITION && this._indices === null) {
        this._count = data.length;
    }

    attribute.buffer.bufferData(attribute.dataArray);
}

Mesh.prototype.getIndices = function() {
    return this._indices;
}

//TODO: test this
//TODO: update count
//TODO: copy data ref
/**
 * Updates index buffer
 * @param  {Array of Int or Array or Arrays} data must have length > 0
 */
Mesh.prototype.updateIndices = function(data) {
    var indices = this._indices;

    if (!indices) {
        throw new Error('Mesh.updateIndices: mesh has no indices to update');
    }
    if (data.length * indices.size != indices.dataArray.length) {
        if (indices.dataArray instanceof Uint32Array) {
            indices.dataArray = new Uint32Array(data.length * indices.size);
        }
        else {
            indices.dataArray = new Uint16Array(data.length * indices.size);
        }
    }

    if (isFlatArray(data)) {
        indices.dataArray.set(data);
    }
    else {
        //ASSUMING we don't suddently change face3 into face2 or flat, so size is the same
        unpack(data, indices.dataArray, indices.size);
    }

    indices.data = data;

    //ASSUMING we don't suddently change face3 into face2 or flat, so size is the same
    //TODO: test this
    this._count = data.length * indices.size;
    indices.buffer.bufferData(indices.dataArray);
}

module.exports = Mesh;
