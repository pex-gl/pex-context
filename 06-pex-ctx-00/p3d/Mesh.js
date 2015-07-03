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

/**
 * [Mesh description]
 * @param {[type]} ctx              Context
 * @param {[type]} attributesList   Array of { data: Array(flat or list of verts), location: Int, size: Int or guess}
 * @param {[type]} indicesData      Array(flat or list faces)
 * @param {[type]} primitiveType    PrimitiveType (default guesses from indices: no indices = POINTS, list of edges = LINES, list of faces = TRIANGLES)
 */
function Mesh(ctx, attributesList, indicesInfo, primitiveType) {
    this._ctx = ctx;

    var attributesDesc = [];
    var attributes = this._attributes = [];
    var attributesMap = this._attributesMap = {};

    var vertexCount = 0;

    for(var i=0, len=attributesList.length; i<len; i++) {
        var attributeInfo = attributesList[i];
        var data = attributeInfo.data;
        var location = attributeInfo.location;
        var elementSize = data[0].length || 1;
        //TODO: this can be done with !isNaN(data[0])

        //TODO: are we allowing empty attributes e.g. data=[] ?
        if (!data.length) {
            throw new Error('Mesh: Empty attribute data is not supported');
        }

        if (location === undefined) {
            throw new Error('Mesh: Unknown attribute location at index ' + i);
        }

        var dataArray = new Float32Array(data.length * elementSize);
        if (isFlatArray(data[0])) {
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
        attributes.push(attribute);

        attributesMap[location] = attribute;

        if (location == ctx.POSITION) {
            vertexCount = data.length;
        }
    }

    var indicesCount = 0;

    if (indicesInfo) {
        var indicesData = indicesInfo.data;
        var indicesDataElementSize = indicesData[0].length || 1;
        var indicesDataArray = new Uint16Array(indicesData.length * indicesDataElementSize);

        if (isFlatArray(indicesData)) {
            indicesDataArray.set(indicesDataElementSize);
        }
        else {
            unpack(indicesData, indicesDataArray, indicesDataElementSize)
        }

        var usage = indicesInfo.usage || ctx.STATIC_DRAW;

        var indicesBuffer  = ctx.createBuffer(ctx.ELEMENT_ARRAY_BUFFER, indicesDataArray, usage);

        if (!primitiveType) {
            if (indicesDataElementSize == 1) primiviteType = ctx.POINTS;
            if (indicesDataElementSize == 2) primiviteType = ctx.LINES;
            if (indicesDataElementSize == 3) primiviteType = ctx.TRIANGLES;
        }

        var indices = this._indices = {
            data: indicesData,
            dataArray: indicesDataArray,
            buffer: indicesBuffer
        };

        indicesCount = indicesData.length * indicesDataElementSize;
    }
    else {
        this._indices = null;
    }

    this._primiviteType = primiviteType || ctx.TRIANGLES;
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

    if (data.length != attribute.data.length) {
        attribute.dataArray = new Float32Array(data.length);
    }

    if (isFlatArray(data)) {
        attribute.dataArray.set(data);
    }
    else {
        //ASSUMING we don't suddently change Vec2 into Vec3, so size is the same
        unpack(data, attribute.dataArray, attribute.size);
    }

    //TODO: What about data ownership? Are we assuming that you updated the same data array or should we copy it?
    //if (data != attribute.data) {
    //  deepCopy(attribute.data, data);
    //}

    attribute.buffer.bufferData(attribute.dataArray);
}

Mesh.prototype.getIndices = function() {
    return this._indices;
}

//TODO: test this
Mesh.prototype.updateIndices = function(data) {
    var indices = this._indices;

    if (!indices) {
        throw new Error('Mesh.updateIndices: mesh has no indices to update');
    }
    if (data.length != indices.data.length) {
        indices.dataArray = new Float32Array(data.length);
    }

    if (isFlatArray(data)) {
        indices.dataArray.set(data);
    }
    else {
        //ASSUMING we don't suddently change Vec2 into Vec3, so size is the same
        unpack(data, indices.dataArray, data[0].length);
    }
}

module.exports = Mesh;
